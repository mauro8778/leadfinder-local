import { addMessage } from "./inbox";
import { normalizePhoneForWhatsApp } from "./whatsapp";

export type WhatsAppProviderKind = "none" | "evolution" | "cloud";

export function getWhatsAppProvider(): WhatsAppProviderKind {
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return "cloud";
  }
  return "evolution";
}

export function getWhatsAppPublicStatus() {
  const provider = getWhatsAppProvider();
  return {
    configured: provider !== "none",
    provider,
    instance: process.env.EVOLUTION_INSTANCE ?? "leadfinder",
  };
}

function evolutionHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: process.env.EVOLUTION_API_KEY ?? "leadfinder-local",
  };
}

function evolutionBase(): string {
  const raw = process.env.EVOLUTION_URL ?? "http://127.0.0.1:8080";
  const withProtocol = raw.startsWith("http") ? raw : `http://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

function webhookPublicUrl(): string {
  if (process.env.WHATSAPP_WEBHOOK_URL) {
    return process.env.WHATSAPP_WEBHOOK_URL;
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}/api/whatsapp/webhook`;
  }
  return "http://host.docker.internal:4317/api/whatsapp/webhook";
}

function evolutionInstance(): string {
  return process.env.EVOLUTION_INSTANCE ?? "leadfinder";
}

function evolutionOfflineMessage(): string {
  return "El conector de WhatsApp no está prendido en la PC. En la computadora instalá Docker y corré: docker compose -f docker-compose.whatsapp.yml up -d. Después pedí el código de nuevo.";
}

function isOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  const blob = `${error.message} ${cause?.code ?? ""} ${cause?.message ?? ""}`.toLowerCase();
  return (
    blob.includes("fetch failed") ||
    blob.includes("econnrefused") ||
    blob.includes("enotfound") ||
    blob.includes("etimedout") ||
    blob.includes("econnreset")
  );
}

async function evolutionFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(`${evolutionBase()}${path}`, {
      ...init,
      headers: { ...evolutionHeaders(), ...init?.headers },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    if (isOfflineError(error)) {
      throw new Error(evolutionOfflineMessage());
    }
    throw error;
  }
}

export async function sendWhatsAppText(phone: string, text: string): Promise<string | null> {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    throw new Error("Teléfono inválido");
  }

  const provider = getWhatsAppProvider();
  if (provider === "evolution") {
    const response = await evolutionFetch(`/message/sendText/${evolutionInstance()}`, {
      method: "POST",
      body: JSON.stringify({ number: normalized, text }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      key?: { id?: string };
      error?: string;
      message?: string;
    };
    if (!response.ok) {
      throw new Error(payload.error ?? payload.message ?? "Evolution no pudo enviar");
    }
    return payload.key?.id ?? null;
  }

  if (provider === "cloud") {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalized,
          type: "text",
          text: { body: text },
        }),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new Error(payload.error?.message ?? "WhatsApp Cloud no pudo enviar");
    }
    return payload.messages?.[0]?.id ?? null;
  }

  throw new Error(
    "WhatsApp no está conectado. Levantá Evolution (QR) o cargá la API oficial en .env",
  );
}

async function ensureEvolutionInstance(): Promise<void> {
  const instance = evolutionInstance();
  const webhookUrl = webhookPublicUrl();

  await evolutionFetch("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName: instance,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  }).catch(() => undefined);

  await evolutionFetch(`/webhook/set/${instance}`, {
    method: "POST",
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        events: ["MESSAGES_UPSERT"],
      },
    }),
  }).catch(() => undefined);
}

export async function getEvolutionState(): Promise<{
  state: string;
  qr?: string | null;
  pairingCode?: string | null;
}> {
  if (getWhatsAppProvider() !== "evolution") {
    return { state: "disconnected" };
  }

  await ensureEvolutionInstance();

  const instance = evolutionInstance();
  const stateRes = await evolutionFetch(`/instance/connectionState/${instance}`);
  const statePayload = (await stateRes.json().catch(() => ({}))) as {
    instance?: { state?: string };
    state?: string;
  };
  const state = statePayload.instance?.state ?? statePayload.state ?? "unknown";

  if (state === "open") {
    return { state: "open" };
  }

  const qrRes = await evolutionFetch(`/instance/connect/${instance}`);
  const qrPayload = (await qrRes.json().catch(() => ({}))) as {
    base64?: string;
    pairingCode?: string;
    qrcode?: { base64?: string; pairingCode?: string };
  };
  return {
    state,
    qr: qrPayload.base64 ?? qrPayload.qrcode?.base64 ?? null,
    pairingCode: formatPairingCode(
      qrPayload.pairingCode ?? qrPayload.qrcode?.pairingCode,
    ),
  };
}

function formatPairingCode(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const raw = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (raw.length < 8) {
    return value;
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export async function requestPairingCode(phone: string): Promise<{
  pairingCode: string;
  state: string;
}> {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    throw new Error("Poné tu número con código de área, por ejemplo 11 2345 6789");
  }

  await ensureEvolutionInstance();
  const instance = evolutionInstance();
  const response = await evolutionFetch(
    `/instance/connect/${instance}?number=${encodeURIComponent(normalized)}`,
  );
  const payload = (await response.json().catch(() => ({}))) as {
    pairingCode?: string;
    qrcode?: { pairingCode?: string };
    error?: string;
    message?: string;
    instance?: { state?: string };
    state?: string;
  };

  if (!response.ok) {
    throw new Error(
      payload.error ??
        payload.message ??
        "No se pudo pedir el código. ¿Está Docker / Evolution levantado?",
    );
  }

  const pairingCode = formatPairingCode(
    payload.pairingCode ?? payload.qrcode?.pairingCode,
  );
  if (!pairingCode) {
    throw new Error(
      "Evolution no devolvió código. Probá de nuevo en 10 segundos o revisá que el conector esté en marcha.",
    );
  }

  return {
    pairingCode,
    state: payload.instance?.state ?? payload.state ?? "pairing",
  };
}

function phoneFromJid(jid: string): string | null {
  const raw = jid.split("@")[0]?.replace(/:\d+$/, "") ?? "";
  return normalizePhoneForWhatsApp(raw);
}

function textFromEvolutionMessage(message: Record<string, unknown> | undefined): string {
  if (!message) {
    return "";
  }
  if (typeof message.conversation === "string") {
    return message.conversation;
  }
  const extended = message.extendedTextMessage as { text?: string } | undefined;
  if (extended?.text) {
    return extended.text;
  }
  const image = message.imageMessage as { caption?: string } | undefined;
  if (image?.caption) {
    return image.caption;
  }
  const video = message.videoMessage as { caption?: string } | undefined;
  if (video?.caption) {
    return video.caption;
  }
  if (message.imageMessage) {
    return "[imagen]";
  }
  if (message.audioMessage) {
    return "[audio]";
  }
  if (message.documentMessage) {
    return "[archivo]";
  }
  return "";
}

export function ingestWhatsAppWebhook(payload: unknown): number {
  if (!payload || typeof payload !== "object") {
    return 0;
  }

  const body = payload as Record<string, unknown>;
  let stored = 0;

  const event = String(body.event ?? body.type ?? "");
  if (event.toLowerCase().includes("messages") || body.data) {
    const data = body.data as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const items = Array.isArray(data) ? data : data ? [data] : [];
    for (const item of items) {
      stored += storeEvolutionItem(item);
    }
  }

  const entries = body.entry as Record<string, unknown>[] | undefined;
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      const changes = entry.changes as Record<string, unknown>[] | undefined;
      for (const change of changes ?? []) {
        const value = change.value as Record<string, unknown> | undefined;
        const messages = value?.messages as Record<string, unknown>[] | undefined;
        const contacts = value?.contacts as { profile?: { name?: string }; wa_id?: string }[] | undefined;
        const contactName = contacts?.[0]?.profile?.name;
        for (const message of messages ?? []) {
          if (message.type && message.type !== "text") {
            const mediaBody =
              message.type === "image"
                ? "[imagen]"
                : message.type === "audio"
                  ? "[audio]"
                  : `[${String(message.type)}]`;
            const from = phoneFromJid(String(message.from ?? ""));
            if (!from) continue;
            addMessage({
              phone: from,
              body: mediaBody,
              direction: "in",
              waId: String(message.id ?? ""),
              name: contactName,
            });
            stored += 1;
            continue;
          }
          const text = (message.text as { body?: string } | undefined)?.body;
          const from = phoneFromJid(String(message.from ?? ""));
          if (!from || !text) continue;
          addMessage({
            phone: from,
            body: text,
            direction: "in",
            waId: String(message.id ?? ""),
            name: contactName,
          });
          stored += 1;
        }
      }
    }
  }

  return stored;
}

function storeEvolutionItem(item: Record<string, unknown>): number {
  const key = item.key as
    | { remoteJid?: string; fromMe?: boolean; id?: string }
    | undefined;
  if (!key?.remoteJid || key.remoteJid.includes("status@broadcast")) {
    return 0;
  }
  const phone = phoneFromJid(key.remoteJid);
  if (!phone) {
    return 0;
  }
  const text = textFromEvolutionMessage(item.message as Record<string, unknown> | undefined);
  if (!text) {
    return 0;
  }
  const pushName = typeof item.pushName === "string" ? item.pushName : null;
  addMessage({
    phone,
    body: text,
    direction: key.fromMe ? "out" : "in",
    waId: key.id ?? null,
    name: pushName,
  });
  return 1;
}
