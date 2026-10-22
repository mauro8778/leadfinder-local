import { ensureSchema, getDb, updateLead } from "./db";
import type { Lead, WaConversation, WaMessage } from "./types";
import { normalizePhoneForWhatsApp } from "./whatsapp";

function rowToConversation(row: Record<string, unknown>): WaConversation {
  return {
    id: Number(row.id),
    phone: String(row.phone ?? ""),
    lead_id:
      row.lead_id !== null && row.lead_id !== undefined
        ? Number(row.lead_id)
        : null,
    name: row.name !== null && row.name !== undefined ? String(row.name) : null,
    last_message:
      row.last_message !== null && row.last_message !== undefined
        ? String(row.last_message)
        : null,
    last_at: String(row.last_at ?? ""),
    unread: Number(row.unread ?? 0),
    lead_name:
      row.lead_name !== null && row.lead_name !== undefined
        ? String(row.lead_name)
        : null,
  };
}

function rowToMessage(row: Record<string, unknown>): WaMessage {
  return {
    id: Number(row.id),
    conversation_id: Number(row.conversation_id),
    wa_id:
      row.wa_id !== null && row.wa_id !== undefined ? String(row.wa_id) : null,
    direction: (row.direction as "in" | "out") ?? "in",
    body: String(row.body ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}

export async function findLeadByPhone(phone: string): Promise<Lead | null> {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    return null;
  }

  await ensureSchema();
  const database = getDb();
  const res = await database.execute(
    "SELECT * FROM leads WHERE phone IS NOT NULL AND TRIM(phone) != ''",
  );

  for (const rawRow of res.rows) {
    const row = rawRow as unknown as Record<string, unknown>;
    const leadPhone = normalizePhoneForWhatsApp(String(row.phone ?? ""));
    if (leadPhone === normalized) {
      return {
        id: Number(row.id),
        osm_id: String(row.osm_id ?? ""),
        osm_type: String(row.osm_type ?? ""),
        name: String(row.name ?? ""),
        rubro: String(row.rubro ?? ""),
        zona: String(row.zona ?? ""),
        address:
          row.address !== null && row.address !== undefined
            ? String(row.address)
            : null,
        phone:
          row.phone !== null && row.phone !== undefined
            ? String(row.phone)
            : null,
        email:
          row.email !== null && row.email !== undefined
            ? String(row.email)
            : null,
        website:
          row.website !== null && row.website !== undefined
            ? String(row.website)
            : null,
        classification:
          (row.classification as Lead["classification"]) ?? "desconocido",
        status: (row.status as Lead["status"]) ?? "sin_contactar",
        notes:
          row.notes !== null && row.notes !== undefined
            ? String(row.notes)
            : null,
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
  }

  return null;
}

export async function getOrCreateConversation(input: {
  phone: string;
  name?: string | null;
  leadId?: number | null;
}): Promise<WaConversation> {
  const phone = normalizePhoneForWhatsApp(input.phone);
  if (!phone) {
    throw new Error("Teléfono inválido");
  }

  await ensureSchema();
  const database = getDb();
  const existingRes = await database.execute({
    sql: "SELECT * FROM wa_conversations WHERE phone = @phone",
    args: { phone },
  });
  const existing = existingRes.rows[0] as unknown as
    | Record<string, unknown>
    | undefined;

  if (existing) {
    const existingLeadId =
      existing.lead_id !== null && existing.lead_id !== undefined
        ? Number(existing.lead_id)
        : null;
    const leadId = input.leadId !== undefined ? input.leadId : existingLeadId;
    const name = input.name !== undefined ? input.name : (existing.name as string | null);

    if (leadId !== existingLeadId || name !== existing.name) {
      await database.execute({
        sql: `UPDATE wa_conversations
              SET lead_id = @lead_id, name = @name
              WHERE id = @id`,
        args: { id: Number(existing.id), lead_id: leadId, name },
      });
    }
    return rowToConversation({ ...existing, lead_id: leadId, name });
  }

  const lead = input.leadId ? null : await findLeadByPhone(phone);
  const leadId = input.leadId ?? lead?.id ?? null;
  const name = input.name ?? lead?.name ?? null;

  const insertRes = await database.execute({
    sql: `INSERT INTO wa_conversations (phone, lead_id, name)
          VALUES (@phone, @lead_id, @name)`,
    args: { phone, lead_id: leadId, name },
  });

  const rowRes = await database.execute({
    sql: "SELECT * FROM wa_conversations WHERE id = @id",
    args: { id: Number(insertRes.lastInsertRowid) },
  });
  const row = rowRes.rows[0] as unknown as Record<string, unknown>;

  return rowToConversation(row);
}

export async function addMessage(input: {
  phone: string;
  body: string;
  direction: "in" | "out";
  waId?: string | null;
  name?: string | null;
  leadId?: number | null;
}): Promise<WaMessage | null> {
  const body = input.body.trim();
  if (!body) {
    return null;
  }

  const conversation = await getOrCreateConversation({
    phone: input.phone,
    name: input.name,
    leadId: input.leadId,
  });

  await ensureSchema();
  const database = getDb();

  if (input.waId) {
    const dupRes = await database.execute({
      sql: "SELECT * FROM wa_messages WHERE wa_id = @wa_id",
      args: { wa_id: input.waId },
    });
    const dup = dupRes.rows[0] as unknown as Record<string, unknown> | undefined;
    if (dup) {
      return rowToMessage(dup);
    }
  }

  const result = await database.execute({
    sql: `INSERT INTO wa_messages (conversation_id, wa_id, direction, body)
          VALUES (@conversation_id, @wa_id, @direction, @body)`,
    args: {
      conversation_id: conversation.id,
      wa_id: input.waId ?? null,
      direction: input.direction,
      body,
    },
  });

  const unreadBump = input.direction === "in" ? 1 : 0;
  await database.execute({
    sql: `UPDATE wa_conversations
          SET last_message = @last_message,
              last_at = datetime('now'),
              unread = unread + @unread
          WHERE id = @id`,
    args: {
      id: conversation.id,
      last_message: body.slice(0, 180),
      unread: unreadBump,
    },
  });

  if (input.direction === "in" && conversation.lead_id) {
    const leadRes = await database.execute({
      sql: "SELECT status FROM leads WHERE id = @id",
      args: { id: conversation.lead_id },
    });
    const lead = leadRes.rows[0] as unknown as { status: string } | undefined;
    if (
      lead &&
      (lead.status === "sin_contactar" || lead.status === "contactado")
    ) {
      await updateLead(conversation.lead_id, { status: "respondio" });
    }
  }

  if (input.direction === "out" && conversation.lead_id) {
    await updateLead(conversation.lead_id, { touch_contact: true });
  }

  const rowRes = await database.execute({
    sql: "SELECT * FROM wa_messages WHERE id = @id",
    args: { id: Number(result.lastInsertRowid) },
  });
  const row = rowRes.rows[0] as unknown as Record<string, unknown>;

  return rowToMessage(row);
}

export async function listConversations(): Promise<WaConversation[]> {
  await ensureSchema();
  const database = getDb();
  const rowsRes = await database.execute(
    `SELECT c.*, l.name as lead_name
     FROM wa_conversations c
     LEFT JOIN leads l ON l.id = c.lead_id
     ORDER BY c.last_at DESC`,
  );
  return (rowsRes.rows as unknown as Record<string, unknown>[]).map(
    rowToConversation,
  );
}

export async function listMessages(
  conversationId: number,
): Promise<WaMessage[]> {
  await ensureSchema();
  const database = getDb();
  const rowsRes = await database.execute({
    sql: `SELECT * FROM wa_messages
          WHERE conversation_id = @conversation_id
          ORDER BY id ASC`,
    args: { conversation_id: conversationId },
  });
  return (rowsRes.rows as unknown as Record<string, unknown>[]).map(
    rowToMessage,
  );
}

export async function markConversationRead(
  conversationId: number,
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: "UPDATE wa_conversations SET unread = 0 WHERE id = @id",
    args: { id: conversationId },
  });
}

export async function getConversationByLeadId(
  leadId: number,
): Promise<WaConversation | null> {
  await ensureSchema();
  const rowRes = await getDb().execute({
    sql: "SELECT * FROM wa_conversations WHERE lead_id = @lead_id",
    args: { lead_id: leadId },
  });
  const row = rowRes.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToConversation(row) : null;
}

export async function unreadCount(): Promise<number> {
  await ensureSchema();
  const rowRes = await getDb().execute(
    "SELECT COALESCE(SUM(unread), 0) as total FROM wa_conversations",
  );
  const row = (rowRes.rows[0] as unknown as { total: number }) ?? {};
  return Number(row.total ?? 0);
}
