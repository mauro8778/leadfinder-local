import { NextResponse } from "next/server";
import { getEvolutionState, getWhatsAppPublicStatus } from "@/lib/whatsapp-provider";

export const dynamic = "force-dynamic";

const RENDER_FREE_WHATSAPP_MSG =
  "En Render free no hay bandeja WhatsApp. Usá el botón WhatsApp en cada lead (abre wa.me con el mensaje). Para inbox: Docker en tu PC o Evolution de pago.";

export async function GET() {
  const status = getWhatsAppPublicStatus();
  if (status.provider === "none") {
    return NextResponse.json({
      ...status,
      state: "unavailable",
      error: RENDER_FREE_WHATSAPP_MSG,
    });
  }
  if (status.provider !== "evolution") {
    return NextResponse.json({ ...status, state: "ready" });
  }

  try {
    const evolution = await getEvolutionState();
    return NextResponse.json({ ...status, ...evolution });
  } catch {
    return NextResponse.json({
      ...status,
      state: "unreachable",
      error: process.env.RENDER
        ? "El conector de WhatsApp todavía no está listo en Render. Esperá 2 minutos y recargá. Si sigue igual, en Render abrí leadfinder-evolution → Logs."
        : "El conector de WhatsApp no está prendido. En la PC: sudo apt install -y docker.io docker-compose-v2 && docker compose -f docker-compose.whatsapp.yml up -d",
    });
  }
}
