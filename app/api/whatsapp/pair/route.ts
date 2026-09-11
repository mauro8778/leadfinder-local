import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPairingCode } from "@/lib/whatsapp-provider";

const schema = z.object({
  phone: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await requestPairingCode(body.phone);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar el código";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
