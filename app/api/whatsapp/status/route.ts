import { NextResponse } from "next/server";
import { getEvolutionState, getWhatsAppPublicStatus } from "@/lib/whatsapp-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getWhatsAppPublicStatus();
  if (status.provider !== "evolution") {
    return NextResponse.json({ ...status, state: status.configured ? "ready" : "setup" });
  }

  try {
    const evolution = await getEvolutionState();
    return NextResponse.json({ ...status, ...evolution });
  } catch {
    return NextResponse.json({
      ...status,
      state: "unreachable",
      error:
        "El conector de WhatsApp no está prendido. En la PC: sudo apt install -y docker.io docker-compose-v2 && docker compose -f docker-compose.whatsapp.yml up -d",
    });
  }
}
