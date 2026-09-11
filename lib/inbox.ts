import { getDb, updateLead } from "./db";
import type { Lead, WaConversation, WaMessage } from "./types";
import { normalizePhoneForWhatsApp } from "./whatsapp";

function rowToConversation(row: Record<string, unknown>): WaConversation {
  return {
    id: row.id as number,
    phone: row.phone as string,
    lead_id: (row.lead_id as number | null) ?? null,
    name: (row.name as string | null) ?? null,
    last_message: (row.last_message as string | null) ?? null,
    last_at: row.last_at as string,
    unread: Number(row.unread ?? 0),
    lead_name: (row.lead_name as string | null) ?? null,
  };
}

function rowToMessage(row: Record<string, unknown>): WaMessage {
  return {
    id: row.id as number,
    conversation_id: row.conversation_id as number,
    wa_id: (row.wa_id as string | null) ?? null,
    direction: row.direction as "in" | "out",
    body: row.body as string,
    created_at: row.created_at as string,
  };
}

export function findLeadByPhone(phone: string): Lead | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    return null;
  }

  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM leads WHERE phone IS NOT NULL AND TRIM(phone) != ''")
    .all() as Record<string, unknown>[];

  for (const row of rows) {
    const leadPhone = normalizePhoneForWhatsApp(String(row.phone ?? ""));
    if (leadPhone === normalized) {
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
        classification: row.classification as Lead["classification"],
        status: row.status as Lead["status"],
        notes: (row.notes as string | null) ?? null,
        last_contacted_at: (row.last_contacted_at as string | null) ?? null,
        sale_amount: (row.sale_amount as number | null) ?? null,
        lat: (row.lat as number | null) ?? null,
        lon: (row.lon as number | null) ?? null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      };
    }
  }

  return null;
}

export function getOrCreateConversation(input: {
  phone: string;
  name?: string | null;
  leadId?: number | null;
}): WaConversation {
  const phone = normalizePhoneForWhatsApp(input.phone);
  if (!phone) {
    throw new Error("Teléfono inválido");
  }

  const database = getDb();
  const existing = database
    .prepare("SELECT * FROM wa_conversations WHERE phone = @phone")
    .get({ phone }) as Record<string, unknown> | undefined;

  if (existing) {
    const leadId = input.leadId ?? (existing.lead_id as number | null);
    const name = input.name ?? (existing.name as string | null);
    if (leadId !== existing.lead_id || name !== existing.name) {
      database
        .prepare(
          `UPDATE wa_conversations
           SET lead_id = @lead_id, name = @name
           WHERE id = @id`,
        )
        .run({ id: existing.id, lead_id: leadId, name });
    }
    return rowToConversation({ ...existing, lead_id: leadId, name });
  }

  const lead = input.leadId ? null : findLeadByPhone(phone);
  const leadId = input.leadId ?? lead?.id ?? null;
  const name = input.name ?? lead?.name ?? null;

  const result = database
    .prepare(
      `INSERT INTO wa_conversations (phone, lead_id, name)
       VALUES (@phone, @lead_id, @name)`,
    )
    .run({ phone, lead_id: leadId, name });

  const row = database
    .prepare("SELECT * FROM wa_conversations WHERE id = @id")
    .get({ id: Number(result.lastInsertRowid) }) as Record<string, unknown>;

  return rowToConversation(row);
}

export function addMessage(input: {
  phone: string;
  body: string;
  direction: "in" | "out";
  waId?: string | null;
  name?: string | null;
  leadId?: number | null;
}): WaMessage | null {
  const body = input.body.trim();
  if (!body) {
    return null;
  }

  const conversation = getOrCreateConversation({
    phone: input.phone,
    name: input.name,
    leadId: input.leadId,
  });

  const database = getDb();

  if (input.waId) {
    const dup = database
      .prepare("SELECT * FROM wa_messages WHERE wa_id = @wa_id")
      .get({ wa_id: input.waId }) as Record<string, unknown> | undefined;
    if (dup) {
      return rowToMessage(dup);
    }
  }

  const result = database
    .prepare(
      `INSERT INTO wa_messages (conversation_id, wa_id, direction, body)
       VALUES (@conversation_id, @wa_id, @direction, @body)`,
    )
    .run({
      conversation_id: conversation.id,
      wa_id: input.waId ?? null,
      direction: input.direction,
      body,
    });

  const unreadBump = input.direction === "in" ? 1 : 0;
  database
    .prepare(
      `UPDATE wa_conversations
       SET last_message = @last_message,
           last_at = datetime('now'),
           unread = unread + @unread
       WHERE id = @id`,
    )
    .run({
      id: conversation.id,
      last_message: body.slice(0, 180),
      unread: unreadBump,
    });

  if (input.direction === "in" && conversation.lead_id) {
    const lead = database
      .prepare("SELECT status FROM leads WHERE id = @id")
      .get({ id: conversation.lead_id }) as { status: string } | undefined;
    if (lead && (lead.status === "sin_contactar" || lead.status === "contactado")) {
      updateLead(conversation.lead_id, { status: "respondio" });
    }
  }

  if (input.direction === "out" && conversation.lead_id) {
    updateLead(conversation.lead_id, { touch_contact: true });
  }

  const row = database
    .prepare("SELECT * FROM wa_messages WHERE id = @id")
    .get({ id: Number(result.lastInsertRowid) }) as Record<string, unknown>;

  return rowToMessage(row);
}

export function listConversations(): WaConversation[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT c.*, l.name as lead_name
       FROM wa_conversations c
       LEFT JOIN leads l ON l.id = c.lead_id
       ORDER BY c.last_at DESC`,
    )
    .all() as Record<string, unknown>[];
  return rows.map(rowToConversation);
}

export function listMessages(conversationId: number): WaMessage[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT * FROM wa_messages
       WHERE conversation_id = @conversation_id
       ORDER BY id ASC`,
    )
    .all({ conversation_id: conversationId }) as Record<string, unknown>[];
  return rows.map(rowToMessage);
}

export function markConversationRead(conversationId: number): void {
  getDb()
    .prepare("UPDATE wa_conversations SET unread = 0 WHERE id = @id")
    .run({ id: conversationId });
}

export function getConversationByLeadId(leadId: number): WaConversation | null {
  const row = getDb()
    .prepare("SELECT * FROM wa_conversations WHERE lead_id = @lead_id")
    .get({ lead_id: leadId }) as Record<string, unknown> | undefined;
  return row ? rowToConversation(row) : null;
}

export function unreadCount(): number {
  const row = getDb()
    .prepare("SELECT COALESCE(SUM(unread), 0) as total FROM wa_conversations")
    .get() as { total: number };
  return Number(row.total ?? 0);
}
