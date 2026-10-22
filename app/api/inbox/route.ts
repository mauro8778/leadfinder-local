import { NextResponse } from "next/server";
import {
  getConversationByLeadId,
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  unreadCount,
} from "@/lib/inbox";
import { getWhatsAppPublicStatus } from "@/lib/whatsapp-provider";
import { normalizePhoneForWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = Number(url.searchParams.get("conversationId") ?? "");
  const leadId = Number(url.searchParams.get("leadId") ?? "");

  if (Number.isFinite(conversationId) && conversationId > 0) {
    await markConversationRead(conversationId);
    return NextResponse.json({
      messages: await listMessages(conversationId),
      status: getWhatsAppPublicStatus(),
    });
  }

  if (Number.isFinite(leadId) && leadId > 0) {
    const existing = await getConversationByLeadId(leadId);
    return NextResponse.json({
      conversation: existing,
      messages: existing ? await listMessages(existing.id) : [],
      status: getWhatsAppPublicStatus(),
    });
  }

  const [conversations, unread] = await Promise.all([
    listConversations(),
    unreadCount(),
  ]);

  return NextResponse.json({
    conversations,
    unread,
    status: getWhatsAppPublicStatus(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    phone?: string;
    leadId?: number;
    name?: string;
  };
  if (!body.phone) {
    return NextResponse.json({ error: "Falta el teléfono" }, { status: 400 });
  }
  const phone = normalizePhoneForWhatsApp(body.phone);
  if (!phone) {
    return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
  }
  const conversation = await getOrCreateConversation({
    phone,
    leadId: body.leadId ?? null,
    name: body.name ?? null,
  });
  return NextResponse.json({ conversation });
}
