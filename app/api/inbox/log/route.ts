import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessage } from "@/lib/inbox";

const schema = z.object({
  phone: z.string().min(8),
  text: z.string().min(1),
  leadId: z.number().optional(),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const message = await addMessage({
      phone: body.phone,
      body: body.text,
      direction: "out",
      leadId: body.leadId ?? null,
      name: body.name ?? null,
    });
    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
