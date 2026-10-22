/**
 * lib/notifications.ts
 *
 * Free WhatsApp and webhook notification service for LeadFinder Local.
 * Uses CallMeBot API (https://api.callmebot.com/whatsapp.php) for zero-cost
 * personal WhatsApp alerts, with optional generic webhook fallback (Discord/Slack/n8n).
 *
 * Design Guarantees:
 * - 100% Non-blocking: Errors are caught and logged with console.warn, never throwing.
 * - Strict timeout: AbortSignal.timeout(4000) prevents serverless function hangs.
 * - Graceful degradation: If unconfigured or disabled, returns false immediately without network calls.
 * - Preserves prospect outreach (wa.me) completely separate from personal notifications.
 */

export const CALLMEBOT_API_URL = "https://api.callmebot.com/whatsapp.php";
export const NOTIFICATION_TIMEOUT_MS = 4000;

export interface NewLeadsNotificationParams {
  count?: number;
  stored?: number;
  found?: number;
  withPhone?: number;
  rubro: string;
  zona: string;
  sampleNames?: string[];
}

export interface StatusChangeNotificationParams {
  leadName: string;
  previousStatus?: string;
  oldStatus?: string;
  newStatus: string;
  notes?: string | null;
  phone?: string | null;
  zona?: string | null;
  saleAmount?: number | null;
}

/**
 * Checks whether notifications are configured via environment variables.
 * CallMeBot requires both CALLMEBOT_PHONE and CALLMEBOT_API_KEY.
 * Alternatively, WHATSAPP_WEBHOOK_URL or NOTIFY_WEBHOOK_URL may be provided.
 */
export function isNotificationConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const hasPhone = Boolean(env.CALLMEBOT_PHONE?.trim());
  const hasKey = Boolean(env.CALLMEBOT_API_KEY?.trim());
  const hasWebhook = Boolean(
    env.WHATSAPP_WEBHOOK_URL?.trim() || env.NOTIFY_WEBHOOK_URL?.trim(),
  );
  return (hasPhone && hasKey) || hasWebhook;
}

/**
 * Normalizes destination phone and constructs the CallMeBot API GET URL.
 */
export function formatCallMeBotUrl(phone: string, text: string, apiKey: string): string {
  const cleanPhone = phone.trim().replace(/\D/g, "");
  return `${CALLMEBOT_API_URL}?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey.trim())}`;
}

/**
 * Sends a message via CallMeBot WhatsApp API.
 * Never throws — catches errors and returns boolean.
 */
export async function sendCallMeBotNotification(
  text: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const phone = env.CALLMEBOT_PHONE?.trim();
  const apiKey = env.CALLMEBOT_API_KEY?.trim();

  if (!phone || !apiKey) {
    return false;
  }

  const url = formatCallMeBotUrl(phone, text, apiKey);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[Notifications] CallMeBot API responded with status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      "[Notifications] CallMeBot dispatch error:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

/**
 * Sends a payload to an optional generic webhook endpoint (Discord, Slack, n8n, etc.).
 * Never throws — catches errors and returns boolean.
 */
export async function sendWebhookNotification(
  event: string,
  text: string,
  data: Record<string, unknown> = {},
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const webhookUrl = env.WHATSAPP_WEBHOOK_URL?.trim() || env.NOTIFY_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        text,
        data,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[Notifications] Webhook responded with status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      "[Notifications] Webhook dispatch error:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

/**
 * Unified notification dispatcher. Sends to CallMeBot and/or Webhook in parallel.
 * Non-blocking, never throws.
 */
export async function dispatchNotification(
  event: "new_leads" | "status_change",
  text: string,
  data: Record<string, unknown> = {},
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  try {
    if (env.NOTIFY_ENABLED === "false") {
      return false;
    }

    if (!isNotificationConfigured(env)) {
      return false;
    }

    const tasks: Promise<boolean>[] = [];

    if (env.CALLMEBOT_PHONE?.trim() && env.CALLMEBOT_API_KEY?.trim()) {
      tasks.push(sendCallMeBotNotification(text, env));
    }

    if (env.WHATSAPP_WEBHOOK_URL?.trim() || env.NOTIFY_WEBHOOK_URL?.trim()) {
      tasks.push(sendWebhookNotification(event, text, data, env));
    }

    if (tasks.length === 0) {
      return false;
    }

    const results = await Promise.allSettled(tasks);
    return results.some((r) => r.status === "fulfilled" && r.value === true);
  } catch (error) {
    console.warn(
      "[Notifications] Error in dispatchNotification:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

/**
 * Dispatches a notification when new leads are found and stored.
 * Non-blocking: catches any errors and logs a warning instead of throwing.
 */
export async function notifyNewLeads(
  count: number,
  rubro: string,
  zona: string,
  sampleNames?: string[],
): Promise<boolean>;
export async function notifyNewLeads(
  params: NewLeadsNotificationParams,
): Promise<boolean>;
export async function notifyNewLeads(
  countOrParams: number | NewLeadsNotificationParams,
  rubro?: string,
  zona?: string,
  sampleNames?: string[],
): Promise<boolean> {
  try {
    if (process.env.NOTIFY_ENABLED === "false" || process.env.NOTIFY_ON_NEW_LEADS === "false") {
      return false;
    }

    if (!isNotificationConfigured()) {
      return false;
    }

    let count = 0;
    let rubroStr = "";
    let zonaStr = "";
    let samples: string[] | undefined = sampleNames;
    let found: number | undefined;
    let withPhone: number | undefined;

    if (typeof countOrParams === "object" && countOrParams !== null) {
      count = countOrParams.count ?? countOrParams.stored ?? 0;
      rubroStr = countOrParams.rubro ?? "";
      zonaStr = countOrParams.zona ?? "";
      samples = countOrParams.sampleNames ?? samples;
      found = countOrParams.found;
      withPhone = countOrParams.withPhone;
    } else {
      count = countOrParams;
      rubroStr = rubro ?? "";
      zonaStr = zona ?? "";
    }

    const lines = [
      "🎯 *LeadFinder: Nuevos leads guardados*",
      "━━━━━━━━━━━━━━━━━━━━",
      `📍 *Zona:* ${zonaStr}`,
      `🏷️ *Rubro:* ${rubroStr}`,
    ];

    if (found !== undefined && withPhone !== undefined) {
      lines.push(`📊 *Encontrados:* ${found} (${withPhone} con WhatsApp)`);
    }

    lines.push(`💾 *Guardados:* ${count} leads listos para prospección.`);

    if (samples && samples.length > 0) {
      lines.push(`🏢 *Ejemplos:* ${samples.slice(0, 3).join(", ")}`);
    }

    const text = lines.join("\n");
    return dispatchNotification("new_leads", text, {
      count,
      found,
      withPhone,
      rubro: rubroStr,
      zona: zonaStr,
      sampleNames: samples,
    });
  } catch (error) {
    console.warn(
      "[Notifications] Error in notifyNewLeads:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

/**
 * Dispatches a notification when a lead's CRM status changes.
 * Non-blocking: catches any errors and logs a warning instead of throwing.
 */
export async function notifyLeadStatusChanged(
  leadName: string,
  oldStatus: string,
  newStatus: string,
  notes?: string | null,
): Promise<boolean>;
export async function notifyLeadStatusChanged(
  params: StatusChangeNotificationParams,
): Promise<boolean>;
export async function notifyLeadStatusChanged(
  leadNameOrParams: string | StatusChangeNotificationParams,
  oldStatus?: string,
  newStatus?: string,
  notes?: string | null,
): Promise<boolean> {
  try {
    if (process.env.NOTIFY_ENABLED === "false" || process.env.NOTIFY_ON_STATUS_CHANGE === "false") {
      return false;
    }

    if (!isNotificationConfigured()) {
      return false;
    }

    let leadName = "";
    let fromStatus = "";
    let toStatus = "";
    let noteText: string | null | undefined = notes;
    let phone: string | null | undefined;
    let zona: string | null | undefined;
    let saleAmount: number | null | undefined;

    if (typeof leadNameOrParams === "object" && leadNameOrParams !== null) {
      leadName = leadNameOrParams.leadName;
      fromStatus = leadNameOrParams.previousStatus ?? leadNameOrParams.oldStatus ?? "sin_contactar";
      toStatus = leadNameOrParams.newStatus;
      noteText = leadNameOrParams.notes;
      phone = leadNameOrParams.phone;
      zona = leadNameOrParams.zona;
      saleAmount = leadNameOrParams.saleAmount;
    } else {
      leadName = leadNameOrParams;
      fromStatus = oldStatus ?? "sin_contactar";
      toStatus = newStatus ?? "";
    }

    const isSale = toStatus === "vendido";
    const isHot = toStatus === "interesado" || toStatus === "respondio";

    const icon = isSale ? "🎉" : isHot ? "🔥" : "🔔";
    const title = isSale
      ? "¡Venta Cerrada!"
      : isHot
        ? "¡Lead Interesado!"
        : "Actualización de Estado";

    const lines = [
      `${icon} *LeadFinder: ${title}*`,
      "━━━━━━━━━━━━━━━━━━━━",
      `🏢 *Comercio:* ${leadName}`,
    ];

    if (phone) {
      lines.push(`📞 *Teléfono:* ${phone}`);
    }
    if (zona) {
      lines.push(`📍 *Zona:* ${zona}`);
    }

    lines.push(`🔄 *Estado:* ${fromStatus} ➔ *${toStatus.toUpperCase()}*`);

    if (saleAmount != null) {
      lines.push(`💰 *Monto Venta:* $${saleAmount.toLocaleString("es-AR")} ARS`);
    }
    if (noteText && noteText.trim()) {
      lines.push(`📝 *Nota:* ${noteText.trim()}`);
    }

    const text = lines.join("\n");
    return dispatchNotification("status_change", text, {
      leadName,
      oldStatus: fromStatus,
      newStatus: toStatus,
      notes: noteText,
      phone,
      zona,
      saleAmount,
    });
  } catch (error) {
    console.warn(
      "[Notifications] Error in notifyLeadStatusChanged:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}
