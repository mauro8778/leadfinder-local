import { NextResponse } from "next/server";
import { z } from "zod";
import { updateLead } from "@/lib/db";
import type { LeadStatus } from "@/lib/types";

const patchSchema = z
  .object({
    status: z.enum([
      "sin_contactar",
      "contactado",
      "respondio",
      "interesado",
      "vendido",
      "no_interesa",
    ]),
    notes: z.string().nullable(),
    sale_amount: z.number().nullable(),
    touch_contact: z.boolean(),
  })
  .partial()
  .refine(
    (body) =>
      body.status !== undefined ||
      body.notes !== undefined ||
      body.sale_amount !== undefined ||
      body.touch_contact !== undefined,
    { message: "Sin campos para actualizar" },
  );

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const leadId = Number(id);

    if (Number.isNaN(leadId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = patchSchema.parse(await request.json());
    const lead = updateLead(leadId, {
      status: body.status as LeadStatus | undefined,
      notes: body.notes,
      sale_amount: body.sale_amount,
      touch_contact: body.touch_contact,
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
