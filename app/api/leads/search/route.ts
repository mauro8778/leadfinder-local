import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertLeadsFromSearch } from "@/lib/db";
import { searchPlaces } from "@/lib/overpass";
import { getRubro } from "@/lib/rubros";
import { hasWhatsAppPhone } from "@/lib/whatsapp";
import { notifyNewLeads } from "@/lib/notifications";

export const maxDuration = 60;

const bodySchema = z.object({
  zona: z.string().min(2),
  rubro: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    if (!getRubro(body.rubro)) {
      return NextResponse.json({ error: "Rubro inválido" }, { status: 400 });
    }

    const places = await searchPlaces(body.zona, body.rubro);
    const leads = await upsertLeadsFromSearch(places, body.rubro, body.zona);

    const withPhone = places.filter((place) => hasWhatsAppPhone(place.phone)).length;

    if (leads.length > 0) {
      const sampleNames = leads.slice(0, 3).map((l) => l.name);
      notifyNewLeads(leads.length, body.rubro, body.zona, sampleNames).catch((err) => {
        console.warn("[Notifications] Error in notifyNewLeads:", err);
      });
    }

    return NextResponse.json({
      found: places.length,
      stored: leads.length,
      withPhone,
      leads,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error en búsqueda";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
