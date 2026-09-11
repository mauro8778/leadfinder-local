import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertLeadsFromSearch } from "@/lib/db";
import { getRubro } from "@/lib/rubros";
import { hasWhatsAppPhone } from "@/lib/whatsapp";

const placeSchema = z.object({
  osmId: z.string().min(1),
  osmType: z.string().min(1),
  name: z.string().min(1),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
});

const bodySchema = z.object({
  zona: z.string().min(2),
  rubro: z.string().min(2),
  places: z.array(placeSchema).max(500),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    if (!getRubro(body.rubro)) {
      return NextResponse.json({ error: "Rubro inválido" }, { status: 400 });
    }

    const leads = upsertLeadsFromSearch(body.places, body.rubro, body.zona);
    const withPhone = body.places.filter((place) => hasWhatsAppPhone(place.phone)).length;

    return NextResponse.json({
      found: body.places.length,
      stored: leads.length,
      withPhone,
      leads,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar leads";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
