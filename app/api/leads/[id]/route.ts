import { NextResponse } from "next/server";
import { z } from "zod";
import { updateLead, getDb } from "@/lib/db";
import { notifyLeadStatusChanged } from "@/lib/notifications";
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

    const database = getDb();
    const currentRes = await database.execute({
      sql: "SELECT id, name, status, notes FROM leads WHERE id = @id",
      args: { id: leadId },
    });
    const currentLead = currentRes.rows[0] as unknown as {
      id: number;
      name: string;
      status: string;
      notes: string | null;
    } | undefined;

    const lead = await updateLead(leadId, {
      status: body.status as LeadStatus | undefined,
      notes: body.notes,
      sale_amount: body.sale_amount,
      touch_contact: body.touch_contact,
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    const newStatus = body.status ?? (lead.status !== currentLead?.status ? lead.status : undefined);
    if (newStatus && currentLead && currentLead.status !== newStatus) {
      notifyLeadStatusChanged(
        currentLead.name,
        currentLead.status,
        newStatus,
        body.notes ?? (lead.notes || undefined),
      ).catch((err) => {
        console.warn("[Notifications] Error in notifyLeadStatusChanged:", err);
      });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
