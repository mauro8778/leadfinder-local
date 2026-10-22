"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { downloadLeadsCsv } from "@/lib/csv";
import { FOLLOW_UP_DAYS } from "@/lib/constants";
import { buildDemoUrl, DEMO_SITES, getDemoForRubro } from "@/lib/demos";
import { RUBRO_CATEGORIES, RUBROS } from "@/lib/rubros";
import type { Lead, LeadStats, LeadStatus } from "@/lib/types";
import {
  buildEmailBody,
  buildEmailSubject,
  buildMailtoLink,
} from "@/lib/outreach";
import {
  getAddonsForSelection,
  getBaseAmount,
  isAddonRecommended,
  sumAddons,
  toggleAddonSelection,
} from "@/lib/addon-packs";
import {
  PRICING_OPTIONS,
  SERVICE_PACKAGES,
  WHATSAPP_TEMPLATES,
  type PricingOptionId,
  type WhatsAppTemplateId,
} from "@/lib/outreach-templates";
import { MessageAutocomplete } from "./message-autocomplete";
import { SalesPlaybookPanel } from "./sales-playbook-panel";
import { WhatsAppInbox } from "./whatsapp-inbox";
import type { MessageSuggestion } from "@/lib/message-suggestions";
import {
  buildOutreachMessage,
  buildWhatsAppLink,
  hasWhatsAppPhone,
} from "@/lib/whatsapp";
import type { OutreachContext } from "@/lib/outreach";
import { importPlacesInBatches } from "@/lib/import-leads-client";
import { searchPlacesOsm } from "@/lib/osm-search";

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "sin_contactar", label: "Sin contactar" },
  { value: "contactado", label: "Contactado" },
  { value: "respondio", label: "Respondió" },
  { value: "interesado", label: "Interesado" },
  { value: "vendido", label: "Vendido" },
  { value: "no_interesa", label: "No interesa" },
];

const CLASS_LABELS: Record<string, string> = {
  sin_web: "Sin web",
  solo_redes: "Solo redes",
  tiene_web: "Tiene web",
  desconocido: "Desconocido",
};

interface LeadDashboardProps {
  initialLeads?: Lead[];
  initialStats?: LeadStats | null;
}

const DEMO_URL_KEY = "leadfinder-demo-url";
const ADDON_IDS_KEY = "leadfinder-addon-ids";
const EXTRA_NOTE_KEY = "leadfinder-extra-note";
const FILTER_SIN_WEB_KEY = "leadfinder-filter-sin-web";
const FILTER_SIN_TEL_KEY = "leadfinder-filter-sin-tel";

function formatContactDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value.includes("T") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function readStoredString(key: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key) ?? "";
}

function readStoredAddonIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(ADDON_IDS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function parseContactTime(value: string): number {
  return new Date(value.includes("T") ? value : `${value}Z`).getTime();
}

function isFollowUpDue(lastContactedAt: string, nowMs: number | null): boolean {
  if (!nowMs) {
    return false;
  }
  return nowMs - parseContactTime(lastContactedAt) >= FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000;
}

let clockMs = 0;
const clockListeners = new Set<() => void>();
let clockInterval: number | null = null;

function subscribeToClock(onStoreChange: () => void): () => void {
  clockListeners.add(onStoreChange);
  if (clockListeners.size === 1 && typeof window !== "undefined") {
    clockMs = Date.now();
    window.setTimeout(() => {
      clockMs = Date.now();
      clockListeners.forEach((listener) => listener());
    }, 0);
    clockInterval = window.setInterval(() => {
      clockMs = Date.now();
      clockListeners.forEach((listener) => listener());
    }, 60_000);
  }
  return () => {
    clockListeners.delete(onStoreChange);
    if (clockListeners.size === 0 && clockInterval !== null) {
      window.clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

function getClockSnapshot(): number {
  return clockMs;
}

function getServerClockSnapshot(): number {
  return 0;
}

export function LeadDashboard({
  initialLeads = [],
  initialStats = null,
}: LeadDashboardProps) {
  const nowMs = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [zona, setZona] = useState("Merlo, Buenos Aires, Argentina");
  const [rubro, setRubro] = useState("peluqueria");
  const [sinWebOnly, setSinWebOnly] = useState(true);
  const [incluirSinTelefono, setIncluirSinTelefono] = useState(true);
  const [seguirHoy, setSeguirHoy] = useState(false);
  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>("consulta");
  const [pricingId, setPricingId] = useState<PricingOptionId>("sin_precio");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [extraNote, setExtraNote] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [stats, setStats] = useState<LeadStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<string | null>(null);
  const [searchPhase, setSearchPhase] = useState<string | null>(null);
  const [inboxLead, setInboxLead] = useState<{
    id: number;
    name: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedDemo = readStoredString(DEMO_URL_KEY);
      if (savedDemo) setDemoUrl(savedDemo);

      const savedNote = readStoredString(EXTRA_NOTE_KEY);
      if (savedNote) setExtraNote(savedNote);

      const savedSinWeb = localStorage.getItem(FILTER_SIN_WEB_KEY);
      if (savedSinWeb === "0") setSinWebOnly(false);

      const savedSinTel = localStorage.getItem(FILTER_SIN_TEL_KEY);
      if (savedSinTel === "0") setIncluirSinTelefono(false);

      const savedAddons = readStoredAddonIds();
      if (savedAddons.length > 0) setAddonIds(savedAddons);

      setStorageLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const loadLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (sinWebOnly) {
      params.set("sinWebOnly", "true");
    }
    if (!incluirSinTelefono) {
      params.set("conTelefonoOnly", "true");
    }
    if (seguirHoy) {
      params.set("seguirHoy", "true");
    }

    setFetching(true);
    try {
      const response = await fetch(`/api/leads?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Error al cargar leads");
      }

      setLeads(data.leads);
      setStats(data.stats);
      setError(null);
    } finally {
      setFetching(false);
    }
  }, [sinWebOnly, incluirSinTelefono, seguirHoy]);

  useEffect(() => {
    if (!storageLoaded) return;
    localStorage.setItem(DEMO_URL_KEY, demoUrl);
  }, [demoUrl, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    localStorage.setItem(ADDON_IDS_KEY, JSON.stringify(addonIds));
  }, [addonIds, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    localStorage.setItem(EXTRA_NOTE_KEY, extraNote);
  }, [extraNote, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    localStorage.setItem(FILTER_SIN_WEB_KEY, sinWebOnly ? "1" : "0");
  }, [sinWebOnly, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    localStorage.setItem(FILTER_SIN_TEL_KEY, incluirSinTelefono ? "1" : "0");
  }, [incluirSinTelefono, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const timer = window.setTimeout(() => {
      void loadLeads().catch((err: Error) => setError(err.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadLeads, storageLoaded]);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSearchInfo(null);
    setSearchPhase("Buscando en OpenStreetMap… no cierres la pestaña.");

    try {
      const places = await searchPlacesOsm(zona, rubro);
      const withPhone = places.filter((place) => hasWhatsAppPhone(place.phone)).length;

      setSearchPhase("Guardando resultados…");
      const data = await importPlacesInBatches(zona, rubro, places);

      await loadLeads();

      if (places.length === 0) {
        setSearchInfo(
          "OSM no devolvió negocios para esa zona y rubro. Probá ampliar la zona o cambiar el rubro.",
        );
      } else {
        const hiddenByPhone =
          !incluirSinTelefono && places.length > withPhone
            ? ` Sin teléfono en OSM: ${places.length - withPhone} (activá “Incluir sin teléfono” para verlos).`
            : "";
        setSearchInfo(
          `${places.length} encontrados en OSM · ${withPhone} con teléfono · ${data.stored} guardados.${hiddenByPhone}`,
        );
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Error desconocido";
      setError(
        raw === "Failed to fetch" || raw.toLowerCase().includes("fetch failed")
          ? "No se pudo consultar OpenStreetMap. Revisá tu conexión, dejá la pestaña abierta e intentá de nuevo."
          : raw.toLowerCase().includes("abort")
            ? "La búsqueda tardó demasiado en el celular. Probá una zona más chica (ej. solo “Merlo”)."
            : raw,
      );
    } finally {
      setLoading(false);
      setSearchPhase(null);
    }
  }

  async function patchLead(
    id: number,
    data: {
      status?: LeadStatus;
      notes?: string | null;
      sale_amount?: number | null;
      touch_contact?: boolean;
    },
  ) {
    const response = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "No se pudo actualizar");
      return;
    }

    await loadLeads();
  }

  async function updateStatus(id: number, status: LeadStatus) {
    await patchLead(id, { status });
  }

  function markContactedOnClick(id: number) {
    void patchLead(id, { touch_contact: true });
  }

  function openInbox(lead: Lead) {
    if (!lead.phone) {
      return;
    }
    setInboxLead({ id: lead.id, name: lead.name, phone: lead.phone });
  }

  function logOutboundWhatsApp(lead: Lead, text: string) {
    if (!lead.phone) {
      return;
    }
    void fetch("/api/inbox/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: lead.phone,
        text,
        leadId: lead.id,
        name: lead.name,
      }),
    });
  }

  const previewRubroLabel =
    RUBROS.find((item) => item.id === rubro)?.label ?? rubro;
  const availableAddons = getAddonsForSelection(pricingId, rubro);
  const selectedAddons = addonIds.filter((id) =>
    availableAddons.some((pack) => pack.id === id),
  );
  const addonTotals = sumAddons(selectedAddons);
  const proposalTotal = getBaseAmount(pricingId) + addonTotals.once;

  function composeMessage(context: OutreachContext): string {
    return buildOutreachMessage(
      context,
      templateId,
      pricingId,
      selectedAddons,
      extraNote,
    );
  }

  function applySuggestion(item: MessageSuggestion) {
    if (item.pricingId) {
      setPricingId(item.pricingId);
    }
    if (item.addonId) {
      setAddonIds((current) => toggleAddonSelection(current, item.addonId!));
    }
    if (item.note) {
      setExtraNote((current) =>
        current.includes(item.note!) ? current : [current, item.note].filter(Boolean).join(" "),
      );
    }
  }

  const previewMessage = composeMessage({
    name: "Ejemplo Comercio",
    rubroLabel: previewRubroLabel,
    zona,
    address: "Av. Ejemplo 123, Merlo",
    demoUrl,
  });
  const selectedTemplate = WHATSAPP_TEMPLATES.find((item) => item.id === templateId);
  const selectedPricing = PRICING_OPTIONS.find((item) => item.id === pricingId);
  const suggestedDemo = getDemoForRubro(rubro);
  const contactados =
    (stats?.contactado ?? 0) +
    (stats?.respondio ?? 0) +
    (stats?.interesado ?? 0) +
    (stats?.vendido ?? 0) +
    (stats?.no_interesa ?? 0);
  const respondieron =
    (stats?.respondio ?? 0) + (stats?.interesado ?? 0) + (stats?.vendido ?? 0);
  const tasaRespuesta =
    contactados > 0 ? Math.round((respondieron / contactados) * 100) : 0;

  return (
    <div className="min-h-full bg-[#f3f1eb] text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-[#111410] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-emerald-400 uppercase">
              LeadFinder Local
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Encontrá negocios sin web y proponeles un sitio.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Búsqueda OSM, CRM y demos listas para WhatsApp. Presupuestos de
              referencia para GBA / CABA.
            </p>
          </div>
          <Link
            href="/demo?interno=1"
            className="inline-flex w-fit rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Ver demos
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">

      <p className="text-sm text-zinc-600">
        Paquetes base. En el mensaje de WhatsApp podés sumar extras: chat IA,
        carga de productos, turnos, portales y más, según el paquete.
      </p>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {SERVICE_PACKAGES.map((pack) => (
          <article
            key={pack.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
              {pack.audience}
            </p>
            <h2 className="mt-1 text-base font-semibold">{pack.name}</h2>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{pack.price}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">{pack.includes}</p>
            <p className="mt-3 text-[11px] text-zinc-500">{pack.delivery}</p>
            {"monthly" in pack && pack.monthly && (
              <p className="text-[11px] text-emerald-800">{pack.monthly}</p>
            )}
          </article>
        ))}
      </section>

      <form
        onSubmit={handleSearch}
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 md:grid-cols-4"
      >
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Zona
          <input
            className="min-h-11 rounded-xl border border-zinc-300 px-3 py-2"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            placeholder="Merlo, Buenos Aires, Argentina"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Rubro
          <select
            className="min-h-11 rounded-xl border border-zinc-300 px-3 py-2"
            value={rubro}
            onChange={(e) => setRubro(e.target.value)}
          >
            {RUBRO_CATEGORIES.map((category) => (
              <optgroup key={category.id} label={category.label}>
                {RUBROS.filter((item) => item.category === category.id).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Buscando OSM…" : "Buscar en OSM"}
          </button>
        </div>
        {searchPhase && (
          <p className="text-sm text-sky-800 md:col-span-4">{searchPhase}</p>
        )}
        <div className="flex flex-col gap-2 md:col-span-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sinWebOnly}
              onChange={(e) => setSinWebOnly(e.target.checked)}
            />
            Mostrar solo sin web / solo redes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={incluirSinTelefono}
              onChange={(e) => setIncluirSinTelefono(e.target.checked)}
            />
            Incluir negocios sin teléfono / WhatsApp{" "}
            <span className="text-xs text-zinc-500">(recomendado: OSM trae pocos teléfonos)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={seguirHoy}
              onChange={(e) => setSeguirHoy(e.target.checked)}
            />
            Solo seguimiento pendiente (+{FOLLOW_UP_DAYS} días sin respuesta)
          </label>
        </div>
      </form>

      {stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ["Sin contactar", stats.sin_contactar],
              ["Contactado", stats.contactado],
              ["Respondió", stats.respondio],
              ["Interesado", stats.interesado],
              ["Vendido", stats.vendido],
            ].map(([label, value]) => (
              <div
                key={label as string}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-2xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-800">Seguir hoy</p>
              <p className="text-2xl font-semibold text-amber-900">{stats.seguir_hoy}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-800">Ventas cerradas</p>
              <p className="text-2xl font-semibold text-emerald-900">
                {formatCurrency(stats.ventas_total)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Tasa de respuesta</p>
              <p className="text-2xl font-semibold">{tasaRespuesta}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Total en base</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {searchInfo && !error && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {searchInfo}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold">Mensaje WhatsApp</h2>
          <p className="text-sm text-zinc-600">
            Elegí plantilla y precios. Al hacer clic en WhatsApp en la tabla se usa
            esta configuración.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4">
            <MessageAutocomplete
              extraNote={extraNote}
              onPick={applySuggestion}
              onAddNote={setExtraNote}
            />
            <label className="flex flex-col gap-1 text-sm">
              Plantilla
              <select
                className="rounded-lg border border-zinc-300 px-3 py-2"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as WhatsAppTemplateId)}
              >
                {WHATSAPP_TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedTemplate && (
              <p className="text-xs text-zinc-500">{selectedTemplate.description}</p>
            )}
            <label className="flex flex-col gap-1 text-sm">
              Precios (referencia GBA / CABA)
              <select
                className="rounded-lg border border-zinc-300 px-3 py-2"
                value={pricingId}
                onChange={(e) => setPricingId(e.target.value as PricingOptionId)}
              >
                {PRICING_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedPricing && (selectedPricing.pitch || selectedPricing.includes) && (
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
                {selectedPricing.pitch && (
                  <p className="text-sm text-zinc-800">{selectedPricing.pitch}</p>
                )}
                {selectedPricing.includes && (
                  <p className="mt-1 text-zinc-500">
                    Incluye: {selectedPricing.includes}
                  </p>
                )}
              </div>
            )}
            {availableAddons.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm font-medium">Packs extra para este paquete</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Marcá lo que quieras sumar. Los recomendados encajan con el
                  rubro o el producto elegido.
                </p>
                <ul className="mt-3 space-y-2">
                  {availableAddons.map((pack) => {
                    const checked = selectedAddons.includes(pack.id);
                    const recommended = isAddonRecommended(pack, rubro);
                    return (
                      <li key={pack.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => {
                              setAddonIds((current) =>
                                toggleAddonSelection(current, pack.id),
                              );
                            }}
                          />
                          <span>
                            <span className="font-medium">{pack.name}</span>
                            {recommended && (
                              <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                                Recomendado
                              </span>
                            )}
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {pack.description}
                            </span>
                            <span className="mt-0.5 block text-xs font-medium text-zinc-700">
                              {formatCurrency(pack.price)}
                              {pack.monthly
                                ? ` + ${formatCurrency(pack.monthly)}/mes`
                                : ""}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                {proposalTotal > 0 && (
                  <p className="mt-3 border-t border-zinc-200 pt-3 text-sm font-semibold">
                    Total referencia: {formatCurrency(proposalTotal)}
                    {addonTotals.monthly > 0
                      ? ` + ${formatCurrency(addonTotals.monthly)}/mes`
                      : ""}
                  </p>
                )}
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm">
              Demo en el mensaje
              <select
                className="rounded-lg border border-zinc-300 px-3 py-2"
                value={
                  DEMO_SITES.find(
                    (demo) => buildDemoUrl(demo.path) === demoUrl || demo.path === demoUrl,
                  )?.id ?? (demoUrl ? "custom" : "")
                }
                onChange={(e) => {
                  const demo = DEMO_SITES.find((item) => item.id === e.target.value);
                  if (demo) {
                    setDemoUrl(buildDemoUrl(demo.path));
                    return;
                  }
                  if (e.target.value === "") {
                    setDemoUrl("");
                  }
                }}
              >
                <option value="">Sin demo en mensaje</option>
                {DEMO_SITES.map((demo) => (
                  <option key={demo.id} value={demo.id}>
                    {demo.label}
                  </option>
                ))}
                {demoUrl &&
                  !DEMO_SITES.some(
                    (demo) =>
                      buildDemoUrl(demo.path) === demoUrl || demo.path === demoUrl,
                  ) && <option value="custom">URL personalizada</option>}
              </select>
            </label>
            {suggestedDemo && (
              <button
                type="button"
                onClick={() => setDemoUrl(buildDemoUrl(suggestedDemo.path))}
                className="text-left text-xs font-medium text-emerald-700 underline"
              >
                Usar demo sugerida para {previewRubroLabel}: {suggestedDemo.label}
              </button>
            )}
            <label className="flex flex-col gap-1 text-sm">
              URL demo (WhatsApp necesita link público al deployar)
              <input
                className="rounded-lg border border-zinc-300 px-3 py-2"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://tudominio.com/demo/peluqueria"
              />
            </label>
            <p className="text-xs text-zinc-500">
              Demos incluidas en este proyecto.{" "}
              <Link href="/demo?interno=1" className="font-medium text-emerald-700 underline">
                Ver demos locales →
              </Link>
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Vista previa
            <textarea
              readOnly
              rows={9}
              className="resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-800"
              value={previewMessage}
            />
          </label>
        </div>
      </section>

      <WhatsAppInbox focusLead={inboxLead} />

      <SalesPlaybookPanel pricingId={pricingId} addonIds={selectedAddons} />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">
            {leads.length} lead{leads.length === 1 ? "" : "s"}
            {seguirHoy ? " · seguimiento pendiente" : ""}
          </p>
          <button
            type="button"
            disabled={leads.length === 0}
            onClick={() => downloadLeadsCsv(leads)}
            className="min-h-10 rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Exportar CSV
          </button>
        </div>
        <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Negocio</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Último contacto</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fetching && leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Cargando leads…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Sin leads con estos filtros. Probá otra búsqueda OSM o activá
                  &quot;Incluir negocios sin teléfono / WhatsApp&quot;.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const rubroLabel =
                  RUBROS.find((item) => item.id === lead.rubro)?.label ?? lead.rubro;
                const outreach = {
                  name: lead.name,
                  rubroLabel,
                  zona: lead.zona,
                  address: lead.address,
                  demoUrl,
                };
                const needsFollowUp =
                  lead.status === "contactado" &&
                  lead.last_contacted_at != null &&
                  isFollowUpDue(lead.last_contacted_at, nowMs);
                const waLink = lead.phone
                  ? buildWhatsAppLink(
                      lead.phone,
                      composeMessage(outreach),
                    )
                  : null;
                const mailtoLink =
                  !waLink && lead.email
                    ? buildMailtoLink(
                        lead.email,
                        buildEmailSubject(outreach),
                        buildEmailBody(outreach),
                      )
                    : null;

                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-zinc-100 align-top ${needsFollowUp ? "bg-amber-50/60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.zona}</p>
                      <p className="text-xs text-zinc-400">
                        {CLASS_LABELS[lead.classification] ?? lead.classification}
                      </p>
                      {needsFollowUp && (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          Seguimiento pendiente
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{lead.address ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p>{lead.phone ?? "—"}</p>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="mt-1 block text-xs text-blue-700 hover:underline"
                        >
                          {lead.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                        value={lead.status}
                        onChange={(e) =>
                          void updateStatus(lead.id, e.target.value as LeadStatus)
                        }
                      >
                        {STATUSES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {lead.status === "vendido" && (
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          placeholder="Monto ARS"
                          defaultValue={lead.sale_amount ?? ""}
                          onBlur={(e) => {
                            const raw = e.target.value.trim();
                            void patchLead(lead.id, {
                              sale_amount: raw === "" ? null : Number(raw),
                            });
                          }}
                          className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600" suppressHydrationWarning>
                      {formatContactDate(lead.last_contacted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        rows={2}
                        defaultValue={lead.notes ?? ""}
                        placeholder="Notas…"
                        onBlur={(e) => {
                          const notes = e.target.value.trim();
                          if (notes === (lead.notes ?? "")) {
                            return;
                          }
                          void patchLead(lead.id, { notes: notes || null });
                        }}
                        className="w-full min-w-[140px] rounded-md border border-zinc-300 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {waLink ? (
                          <>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                markContactedOnClick(lead.id);
                                logOutboundWhatsApp(lead, composeMessage(outreach));
                              }}
                              className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                            >
                              WhatsApp
                            </a>
                            <button
                              type="button"
                              onClick={() => openInbox(lead)}
                              className="inline-flex rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-800"
                            >
                              Chat
                            </button>
                          </>
                        ) : mailtoLink ? (
                          <a
                            href={mailtoLink}
                            onClick={() => markContactedOnClick(lead.id)}
                            className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Email
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">Sin contacto</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        <div className="divide-y divide-zinc-100 lg:hidden">
          {fetching && leads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">Cargando leads…</p>
          ) : leads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              Sin leads con estos filtros. Probá otra búsqueda OSM.
            </p>
          ) : (
            leads.map((lead) => {
              const rubroLabel =
                RUBROS.find((item) => item.id === lead.rubro)?.label ?? lead.rubro;
              const outreach = {
                name: lead.name,
                rubroLabel,
                zona: lead.zona,
                address: lead.address,
                demoUrl,
              };
              const waLink = lead.phone
                ? buildWhatsAppLink(
                    lead.phone,
                    composeMessage(outreach),
                  )
                : null;
              const mailtoLink =
                !waLink && lead.email
                  ? buildMailtoLink(
                      lead.email,
                      buildEmailSubject(outreach),
                      buildEmailBody(outreach),
                    )
                  : null;

              return (
                <article key={lead.id} className="space-y-3 px-4 py-4">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-xs text-zinc-500">{lead.address ?? lead.zona}</p>
                    <p className="text-xs text-zinc-400">
                      {CLASS_LABELS[lead.classification] ?? lead.classification}
                    </p>
                  </div>
                  <p className="text-sm">{lead.phone ?? lead.email ?? "Sin contacto"}</p>
                  <select
                    className="min-h-10 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                    value={lead.status}
                    onChange={(e) =>
                      void updateStatus(lead.id, e.target.value as LeadStatus)
                    }
                  >
                    {STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    defaultValue={lead.notes ?? ""}
                    placeholder="Notas…"
                    onBlur={(e) => {
                      const notes = e.target.value.trim();
                      if (notes === (lead.notes ?? "")) return;
                      void patchLead(lead.id, { notes: notes || null });
                    }}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  />
                  {waLink ? (
                    <div className="flex gap-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        markContactedOnClick(lead.id);
                        logOutboundWhatsApp(lead, composeMessage(outreach));
                      }}
                      className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => openInbox(lead)}
                      className="inline-flex min-h-11 items-center rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-800"
                    >
                      Chat
                    </button>
                    </div>
                  ) : mailtoLink ? (
                    <a
                      href={mailtoLink}
                      onClick={() => markContactedOnClick(lead.id)}
                      className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Email
                    </a>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
