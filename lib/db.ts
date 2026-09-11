import Database from "better-sqlite3";
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

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "leadfinder.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database): void {
  database.exec(`
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
  `);

  migrateColumn(database, "email", "TEXT");
  migrateColumn(database, "notes", "TEXT");
  migrateColumn(database, "last_contacted_at", "TEXT");
  migrateColumn(database, "sale_amount", "REAL");
}

function migrateColumn(
  database: Database.Database,
  name: string,
  type: string,
): void {
  const columns = database
    .prepare("PRAGMA table_info(leads)")
    .all() as { name: string }[];
  if (!columns.some((column) => column.name === name)) {
    database.exec(`ALTER TABLE leads ADD COLUMN ${name} ${type}`);
  }
}

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as number,
    osm_id: row.osm_id as string,
    osm_type: row.osm_type as string,
    name: row.name as string,
    rubro: row.rubro as string,
    zona: row.zona as string,
    address: (row.address as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    classification: row.classification as LeadClassification,
    status: row.status as LeadStatus,
    notes: (row.notes as string | null) ?? null,
    last_contacted_at: (row.last_contacted_at as string | null) ?? null,
    sale_amount: (row.sale_amount as number | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lon: (row.lon as number | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function upsertLeadsFromSearch(
  places: OverpassPlace[],
  rubro: string,
  zona: string,
): Lead[] {
  const database = getDb();
  const insert = database.prepare(`
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
  `);

  const transaction = database.transaction((items: OverpassPlace[]) => {
    for (const place of items) {
      insert.run({
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
      });
    }
  });

  transaction(places);
  return listLeads({ rubro, zona });
}

export function listLeads(filters?: {
  status?: LeadStatus;
  classification?: LeadClassification;
  rubro?: string;
  zona?: string;
  sinWebOnly?: boolean;
  conTelefonoOnly?: boolean;
  seguirHoy?: boolean;
}): Lead[] {
  const database = getDb();
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (filters?.status) {
    conditions.push("status = @status");
    params.status = filters.status;
  }
  if (filters?.classification) {
    conditions.push("classification = @classification");
    params.classification = filters.classification;
  }
  if (filters?.rubro) {
    conditions.push("rubro = @rubro");
    params.rubro = filters.rubro;
  }
  if (filters?.zona) {
    conditions.push("zona = @zona");
    params.zona = filters.zona;
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
  const rows = database.prepare(`SELECT * FROM leads ${where} ORDER BY name ASC`).all(params);

  let leads = rows.map((row) => rowToLead(row as Record<string, unknown>));

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

export function updateLead(id: number, input: UpdateLeadInput): Lead | null {
  const database = getDb();
  const current = database.prepare("SELECT * FROM leads WHERE id = @id").get({ id }) as
    | Record<string, unknown>
    | undefined;

  if (!current) {
    return null;
  }

  const sets: string[] = ["updated_at = datetime('now')"];
  const params: Record<string, unknown> = { id };

  if (input.status !== undefined) {
    sets.push("status = @status");
    params.status = input.status;
  }
  if (input.notes !== undefined) {
    sets.push("notes = @notes");
    params.notes = input.notes;
  }
  if (input.sale_amount !== undefined) {
    sets.push("sale_amount = @sale_amount");
    params.sale_amount = input.sale_amount;
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

  database.prepare(`UPDATE leads SET ${sets.join(", ")} WHERE id = @id`).run(params);

  const row = database.prepare("SELECT * FROM leads WHERE id = @id").get({ id });
  return row ? rowToLead(row as Record<string, unknown>) : null;
}

export function updateLeadStatus(id: number, status: LeadStatus): Lead | null {
  return updateLead(id, { status });
}

export function getStats(): LeadStats {
  const database = getDb();
  const row = database
    .prepare(
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
    )
    .get() as Record<string, number>;

  return {
    total: row.total ?? 0,
    sin_web: row.sin_web ?? 0,
    solo_redes: row.solo_redes ?? 0,
    con_telefono: row.con_telefono ?? 0,
    sin_contactar: row.sin_contactar ?? 0,
    contactado: row.contactado ?? 0,
    respondio: row.respondio ?? 0,
    interesado: row.interesado ?? 0,
    vendido: row.vendido ?? 0,
    no_interesa: row.no_interesa ?? 0,
    seguir_hoy: row.seguir_hoy ?? 0,
    ventas_total: row.ventas_total ?? 0,
  };
}
