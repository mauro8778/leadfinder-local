import { NextResponse } from "next/server";
import { z } from "zod";
import { getStats, listLeads } from "@/lib/db";
import type { LeadClassification, LeadStatus } from "@/lib/types";

const querySchema = z.object({
  status: z
    .enum([
      "sin_contactar",
      "contactado",
      "respondio",
      "interesado",
      "vendido",
      "no_interesa",
    ])
    .optional(),
  classification: z
    .enum(["sin_web", "solo_redes", "tiene_web", "desconocido"])
    .optional(),
  rubro: z.string().optional(),
  zona: z.string().optional(),
  sinWebOnly: z.enum(["true", "false"]).optional(),
  conTelefonoOnly: z.enum(["true", "false"]).optional(),
  seguirHoy: z.enum(["true", "false"]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const filters = parsed.data;
  const leads = listLeads({
    status: filters.status as LeadStatus | undefined,
    classification: filters.classification as LeadClassification | undefined,
    rubro: filters.rubro,
    zona: filters.zona,
    sinWebOnly: filters.sinWebOnly === "true",
    conTelefonoOnly: filters.conTelefonoOnly === "true",
    seguirHoy: filters.seguirHoy === "true",
  });

  return NextResponse.json({
    leads,
    stats: getStats(),
  });
}
