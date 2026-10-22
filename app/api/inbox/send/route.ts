import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessage, findLeadByPhone } from "@/lib/inbox";
import { sendWhatsAppText } from "@/lib/whatsapp-provider";

const schema = z.object({
  phone: z.string().min(8),
  text: z.string().min(1).max(4000),
  leadId: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const lead = body.leadId ? null : await findLeadByPhone(body.phone);
    const waId = await sendWhatsAppText(body.phone, body.text);
    const message = await addMessage({
      phone: body.phone,
      body: body.text,
      direction: "out",
      waId,
      leadId: body.leadId ?? lead?.id ?? null,
    });
    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
