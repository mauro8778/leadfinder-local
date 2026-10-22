import { createClient, type Client, type InValue } from "@libsql/client";
import fs from "fs";
import path from "path";
import type {
  Lead,
  LeadClassification,
  LeadStats,
  LeadStatus,
  OverpassPlace,
} from "./types";
import { classifyWebsite } from "./classify";
import { FOLLOW_UP_DAYS } from "./constants";
import { hasWhatsAppPhone } from "./whatsapp";

let client: Client | null = null;
let schemaInitPromise: Promise<void> | null = null;

function getDatabaseConfig(): { url: string; authToken?: string } {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl) {
    return {
      url: tursoUrl,
      authToken: tursoToken || undefined,
    };
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return {
      url: databaseUrl,
      authToken: tursoToken || undefined,
    };
  }

  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore error in read-only filesystems (e.g. Vercel serverless)
  }
  const dbPath = path.join(dataDir, "leadfinder.db");
  return { url: `file:${dbPath}` };
}

export function getDb(): Client {
  if (!client) {
    const config = getDatabaseConfig();
    client = createClient(config);
  }
  return client;
}

export function getStorageMode(): "turso" | "local-sqlite" {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (
    url &&
    (url.startsWith("libsql://") ||
      url.startsWith("https://") ||
      url.startsWith("http://"))
  ) {
    return "turso";
  }
  return "local-sqlite";
}

const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    osm_id TEXT NOT NULL,
    osm_type TEXT NOT NULL,
    name TEXT NOT NULL,
    rubro TEXT NOT NULL,
    zona TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    classification TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sin_contactar',
    notes TEXT,
    last_contacted_at TEXT,
    sale_amount REAL,
    lat REAL,
    lon REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(osm_type, osm_id, rubro, zona)
  );

  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_classification ON leads(classification);

  CREATE TABLE IF NOT EXISTS wa_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    lead_id INTEGER,
    name TEXT,
    last_message TEXT,
    last_at TEXT NOT NULL DEFAULT (datetime('now')),
    unread INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS wa_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    wa_id TEXT,
    direction TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(wa_id)
  );

  CREATE INDEX IF NOT EXISTS idx_wa_messages_conversation
    ON wa_messages(conversation_id, id);
`;

async function migrateColumns(database: Client): Promise<void> {
  const res = await database.execute("PRAGMA table_info(leads)");
  const existingCols = new Set(res.rows.map((r) => String(r.name)));

  const columnsToEnsure = [
    { name: "email", type: "TEXT" },
    { name: "notes", type: "TEXT" },
    { name: "last_contacted_at", type: "TEXT" },
    { name: "sale_amount", type: "REAL" },
  ];

  for (const col of columnsToEnsure) {
    if (!existingCols.has(col.name)) {
      await database.execute(`ALTER TABLE leads ADD COLUMN ${col.name} ${col.type}`);
    }
  }
}

export async function ensureSchema(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const db = getDb();
      await db.executeMultiple(SCHEMA_DDL);
      await migrateColumns(db);
    })().catch((err) => {
      schemaInitPromise = null;
      throw err;
    });
  }
  return schemaInitPromise;
}

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: Number(row.id),
    osm_id: String(row.osm_id ?? ""),
    osm_type: String(row.osm_type ?? ""),
    name: String(row.name ?? ""),
    rubro: String(row.rubro ?? ""),
    zona: String(row.zona ?? ""),
    address: row.address !== null && row.address !== undefined ? String(row.address) : null,
    phone: row.phone !== null && row.phone !== undefined ? String(row.phone) : null,
    email: row.email !== null && row.email !== undefined ? String(row.email) : null,
    website: row.website !== null && row.website !== undefined ? String(row.website) : null,
    classification: (row.classification as LeadClassification) ?? "desconocido",
    status: (row.status as LeadStatus) ?? "sin_contactar",
    notes: row.notes !== null && row.notes !== undefined ? String(row.notes) : null,
    last_contacted_at:
      row.last_contacted_at !== null && row.last_contacted_at !== undefined
        ? String(row.last_contacted_at)
        : null,
    sale_amount:
      row.sale_amount !== null && row.sale_amount !== undefined
        ? Number(row.sale_amount)
        : null,
    lat: row.lat !== null && row.lat !== undefined ? Number(row.lat) : null,
    lon: row.lon !== null && row.lon !== undefined ? Number(row.lon) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function upsertLeadsFromSearch(
  places: OverpassPlace[],
  rubro: string,
  zona: string,
): Promise<Lead[]> {
  await ensureSchema();
  const database = getDb();

  if (places.length > 0) {
    const statements = places.map((place) => ({
      sql: `
        INSERT INTO leads (
          osm_id, osm_type, name, rubro, zona, address, phone, email, website,
          classification, lat, lon
        ) VALUES (
          @osm_id, @osm_type, @name, @rubro, @zona, @address, @phone, @email, @website,
          @classification, @lat, @lon
        )
        ON CONFLICT(osm_type, osm_id, rubro, zona) DO UPDATE SET
          name = excluded.name,
          address = excluded.address,
          phone = excluded.phone,
          email = excluded.email,
          website = excluded.website,
          classification = excluded.classification,
          lat = excluded.lat,
          lon = excluded.lon,
          updated_at = datetime('now')
      `,
      args: {
        osm_id: place.osmId,
        osm_type: place.osmType,
        name: place.name,
        rubro,
        zona,
        address: place.address,
        phone: place.phone,
        email: place.email,
        website: place.website,
        classification: classifyWebsite(place.website),
        lat: place.lat,
        lon: place.lon,
      },
    }));

    for (let i = 0; i < statements.length; i += 100) {
      await database.batch(statements.slice(i, i + 100), "write");
    }
  }

  return listLeads({ rubro, zona });
}

export async function listLeads(filters?: {
  status?: LeadStatus;
  classification?: LeadClassification;
  rubro?: string;
  zona?: string;
  sinWebOnly?: boolean;
  conTelefonoOnly?: boolean;
  seguirHoy?: boolean;
}): Promise<Lead[]> {
  await ensureSchema();
  const database = getDb();
  const conditions: string[] = [];
  const args: Record<string, string> = {};

  if (filters?.status) {
    conditions.push("status = @status");
    args.status = filters.status;
  }
  if (filters?.classification) {
    conditions.push("classification = @classification");
    args.classification = filters.classification;
  }
  if (filters?.rubro) {
    conditions.push("rubro = @rubro");
    args.rubro = filters.rubro;
  }
  if (filters?.zona) {
    conditions.push("zona = @zona");
    args.zona = filters.zona;
  }
  if (filters?.sinWebOnly) {
    conditions.push("classification IN ('sin_web', 'solo_redes')");
  }
  if (filters?.conTelefonoOnly) {
    conditions.push("phone IS NOT NULL AND TRIM(phone) != ''");
  }
  if (filters?.seguirHoy) {
    conditions.push("status = 'contactado'");
    conditions.push("last_contacted_at IS NOT NULL");
    conditions.push(
      `datetime(last_contacted_at) <= datetime('now', '-${FOLLOW_UP_DAYS} days')`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await database.execute({
    sql: `SELECT * FROM leads ${where} ORDER BY name ASC`,
    args,
  });

  let leads = result.rows.map((row) =>
    rowToLead(row as unknown as Record<string, unknown>),
  );

  if (filters?.conTelefonoOnly) {
    leads = leads.filter((lead) => hasWhatsAppPhone(lead.phone));
  }

  return leads;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  notes?: string | null;
  sale_amount?: number | null;
  touch_contact?: boolean;
}

export async function updateLead(
  id: number,
  input: UpdateLeadInput,
): Promise<Lead | null> {
  await ensureSchema();
  const database = getDb();
  const currentRes = await database.execute({
    sql: "SELECT * FROM leads WHERE id = @id",
    args: { id },
  });

  const current = currentRes.rows[0] as unknown as
    | Record<string, unknown>
    | undefined;

  if (!current) {
    return null;
  }

  const sets: string[] = ["updated_at = datetime('now')"];
  const args: Record<string, InValue> = { id };

  if (input.status !== undefined) {
    sets.push("status = @status");
    args.status = input.status;
  }
  if (input.notes !== undefined) {
    sets.push("notes = @notes");
    args.notes = input.notes;
  }
  if (input.sale_amount !== undefined) {
    sets.push("sale_amount = @sale_amount");
    args.sale_amount = input.sale_amount;
  }
  if (input.touch_contact) {
    sets.push("last_contacted_at = datetime('now')");
    if (current.status === "sin_contactar" && input.status === undefined) {
      sets.push("status = 'contactado'");
    }
  }

  if (sets.length === 1) {
    return rowToLead(current);
  }

  await database.execute({
    sql: `UPDATE leads SET ${sets.join(", ")} WHERE id = @id`,
    args,
  });

  const rowRes = await database.execute({
    sql: "SELECT * FROM leads WHERE id = @id",
    args: { id },
  });
  const row = rowRes.rows[0];
  return row ? rowToLead(row as unknown as Record<string, unknown>) : null;
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus,
): Promise<Lead | null> {
  return updateLead(id, { status });
}

export async function getStats(): Promise<LeadStats> {
  await ensureSchema();
  const database = getDb();
  const result = await database.execute(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN classification = 'sin_web' THEN 1 ELSE 0 END) as sin_web,
      SUM(CASE WHEN classification = 'solo_redes' THEN 1 ELSE 0 END) as solo_redes,
      SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as con_telefono,
      SUM(CASE WHEN status = 'sin_contactar' THEN 1 ELSE 0 END) as sin_contactar,
      SUM(CASE WHEN status = 'contactado' THEN 1 ELSE 0 END) as contactado,
      SUM(CASE WHEN status = 'respondio' THEN 1 ELSE 0 END) as respondio,
      SUM(CASE WHEN status = 'interesado' THEN 1 ELSE 0 END) as interesado,
      SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendido,
      SUM(CASE WHEN status = 'no_interesa' THEN 1 ELSE 0 END) as no_interesa,
      SUM(CASE
        WHEN status = 'contactado'
          AND last_contacted_at IS NOT NULL
          AND datetime(last_contacted_at) <= datetime('now', '-${FOLLOW_UP_DAYS} days')
        THEN 1 ELSE 0 END) as seguir_hoy,
      SUM(CASE WHEN status = 'vendido' AND sale_amount IS NOT NULL THEN sale_amount ELSE 0 END) as ventas_total
    FROM leads`,
  );

  const row = (result.rows[0] as unknown as Record<string, unknown>) ?? {};

  return {
    total: Number(row.total ?? 0),
    sin_web: Number(row.sin_web ?? 0),
    solo_redes: Number(row.solo_redes ?? 0),
    con_telefono: Number(row.con_telefono ?? 0),
    sin_contactar: Number(row.sin_contactar ?? 0),
    contactado: Number(row.contactado ?? 0),
    respondio: Number(row.respondio ?? 0),
    interesado: Number(row.interesado ?? 0),
    vendido: Number(row.vendido ?? 0),
    no_interesa: Number(row.no_interesa ?? 0),
    seguir_hoy: Number(row.seguir_hoy ?? 0),
    ventas_total: Number(row.ventas_total ?? 0),
  };
}
