import { NextResponse } from "next/server";
import { ingestWhatsAppWebhook } from "@/lib/whatsapp-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN ?? "leadfinder-local";

  if (mode === "subscribe" && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-webhook-secret") ?? request.headers.get("apikey");
    if (header !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const payload = await request.json().catch(() => null);
  const stored = await ingestWhatsAppWebhook(payload);
  return NextResponse.json({ ok: true, stored });
}
