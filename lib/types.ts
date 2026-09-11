export type LeadClassification = "sin_web" | "solo_redes" | "tiene_web" | "desconocido";

export type LeadStatus =
  | "sin_contactar"
  | "contactado"
  | "respondio"
  | "interesado"
  | "vendido"
  | "no_interesa";

export interface Lead {
  id: number;
  osm_id: string;
  osm_type: string;
  name: string;
  rubro: string;
  zona: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  classification: LeadClassification;
  status: LeadStatus;
  notes: string | null;
  last_contacted_at: string | null;
  sale_amount: number | null;
  lat: number | null;
  lon: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total: number;
  sin_web: number;
  solo_redes: number;
  con_telefono: number;
  sin_contactar: number;
  contactado: number;
  respondio: number;
  interesado: number;
  vendido: number;
  no_interesa: number;
  seguir_hoy: number;
  ventas_total: number;
}

export interface WaConversation {
  id: number;
  phone: string;
  lead_id: number | null;
  name: string | null;
  last_message: string | null;
  last_at: string;
  unread: number;
  lead_name?: string | null;
}

export interface WaMessage {
  id: number;
  conversation_id: number;
  wa_id: string | null;
  direction: "in" | "out";
  body: string;
  created_at: string;
}

export interface OverpassPlace {
  osmId: string;
  osmType: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lat: number | null;
  lon: number | null;
}
