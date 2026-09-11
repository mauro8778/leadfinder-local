"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WaConversation, WaMessage } from "@/lib/types";

interface InboxStatus {
  configured: boolean;
  provider: "none" | "evolution" | "cloud";
  state?: string;
  qr?: string | null;
  pairingCode?: string | null;
  error?: string;
}

interface WhatsAppInboxProps {
  focusLead?: { id: number; name: string; phone: string } | null;
}

export function WhatsAppInbox({ focusLead }: WhatsAppInboxProps) {
  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<InboxStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerPhone, setOwnerPhone] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/inbox", { cache: "no-store" });
    const data = await response.json();
    setConversations(data.conversations ?? []);
  }, []);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
    const data = await response.json();
    setStatus(data);
    if (data.pairingCode) {
      setPairingCode(data.pairingCode);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: number) => {
    const response = await fetch(`/api/inbox?conversationId=${conversationId}`, {
      cache: "no-store",
    });
    const data = await response.json();
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    const bootstrap = window.setTimeout(() => {
      void loadConversations();
      void loadStatus();
    }, 0);
    const timer = window.setInterval(() => {
      void loadConversations();
      void loadStatus();
      if (selectedId) {
        void loadMessages(selectedId);
      }
    }, 2500);
    return () => {
      window.clearTimeout(bootstrap);
      window.clearInterval(timer);
    };
  }, [loadConversations, loadMessages, loadStatus, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!focusLead?.phone) {
      return;
    }
    void (async () => {
      const created = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: focusLead.phone,
          leadId: focusLead.id,
          name: focusLead.name,
        }),
      });
      const data = await created.json();
      if (data.conversation) {
        setSelectedId(data.conversation.id);
        setSelectedPhone(data.conversation.phone);
        setSelectedLeadId(data.conversation.lead_id);
        await loadMessages(data.conversation.id);
        await loadConversations();
      }
    })();
  }, [focusLead, loadConversations, loadMessages]);

  async function requestPairing(event: React.FormEvent) {
    event.preventDefault();
    setPairing(true);
    setPairingError(null);
    try {
      const response = await fetch("/api/whatsapp/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: ownerPhone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo generar el código");
      }
      setPairingCode(data.pairingCode);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "No se pudo generar el código";
      setPairingError(
        raw === "Failed to fetch" || raw === "fetch failed"
          ? "El conector de WhatsApp no está prendido en la PC. Hay que instalar Docker y levantarlo."
          : raw,
      );
    } finally {
      setPairing(false);
    }
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPhone || !draft.trim()) {
      return;
    }
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selectedPhone,
          text: draft.trim(),
          leadId: selectedLeadId ?? undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo enviar");
      }
      setDraft("");
      if (selectedId) {
        await loadMessages(selectedId);
      }
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  }

  const connected =
    status?.configured &&
    (status.provider === "cloud" || status.state === "open" || status.state === "ready");
  const inboxUnavailable = status?.provider === "none" || status?.state === "unavailable";

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-emerald-100 bg-emerald-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
            Bandeja WhatsApp
          </p>
          <h2 className="text-lg font-semibold text-zinc-900">Chat con clientes</h2>
          <p className="text-xs text-zinc-600">
            Los mensajes entran acá. No se puede incrustar WhatsApp Web: hay que
            conectar tu número.
          </p>
        </div>
        <p
          className={`text-xs font-medium ${connected ? "text-emerald-800" : "text-amber-800"}`}
        >
          {connected
            ? "Conectado · se actualiza solo"
            : inboxUnavailable
              ? "Modo wa.me (sin bandeja)"
              : pairingCode
                ? "Ingresá el código en WhatsApp"
                : status?.state === "unreachable"
                  ? "Falta levantar el conector"
                  : "Falta conectar WhatsApp"}
        </p>
      </div>

      {inboxUnavailable && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">WhatsApp sí funciona, pero sin bandeja acá.</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900">
            En Render free no corre el conector Evolution. Usá el botón{" "}
            <strong>WhatsApp</strong> en cada lead de la tabla: abre la app con el
            mensaje armado. Para ver respuestas adentro del panel, levantá Docker en
            tu PC o pagá el servicio Evolution en Render.
          </p>
        </div>
      )}

      {!connected && !inboxUnavailable && (
        <div className="border-b border-zinc-100 px-4 py-3 text-sm text-zinc-700">
          <div className="space-y-3">
            <p className="font-medium text-zinc-800">
              Si estás en el celular, no hace falta QR. Pedí un código y
              tipealo en WhatsApp.
            </p>
            {pairingCode ? (
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs text-zinc-500">Tu código</p>
                <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.2em] text-emerald-800">
                  {pairingCode}
                </p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
                  <li>Abrí WhatsApp (sin cerrar esta página).</li>
                  <li>Tres puntos o Ajustes → Dispositivos vinculados.</li>
                  <li>Vincular un dispositivo → Vincular con el número de teléfono.</li>
                  <li>Escribí ese código.</li>
                </ol>
              </div>
            ) : (
              <form
                onSubmit={(event) => void requestPairing(event)}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="tel"
                  inputMode="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="Tu WhatsApp, ej. 11 2345 6789"
                  className="min-h-11 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={
                    pairing ||
                    ownerPhone.trim().length < 8 ||
                    status?.state === "unreachable"
                  }
                  className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {pairing ? "Generando…" : "Dame el código"}
                </button>
              </form>
            )}
            {pairingError && <p className="text-xs text-red-700">{pairingError}</p>}
            {status?.state === "unreachable" && (
              <p className="text-xs text-zinc-600">
                El conector tiene que estar corriendo en la PC (Docker). En el
                celular solo tipeás el código. En la computadora:{" "}
                <code className="rounded bg-zinc-100 px-1">
                  sudo apt install -y docker.io docker-compose-v2
                </code>{" "}
                y después{" "}
                <code className="rounded bg-zinc-100 px-1">
                  docker compose -f docker-compose.whatsapp.yml up -d
                </code>
                .
              </p>
            )}
          </div>
          {status?.error && <p className="mt-2 text-xs text-red-700">{status.error}</p>}
        </div>
      )}

      <div className="grid min-h-[420px] lg:grid-cols-[280px_1fr]">
        <aside className="max-h-[520px] overflow-y-auto border-b border-zinc-100 lg:border-r lg:border-b-0">
          {conversations.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">
              Todavía no hay chats. Abrí “Chat” en un lead o esperá una
              respuesta cuando esté conectado.
            </p>
          ) : (
            conversations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setSelectedPhone(item.phone);
                  setSelectedLeadId(item.lead_id);
                  void loadMessages(item.id);
                }}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-zinc-100 px-4 py-3 text-left ${
                  selectedId === item.id ? "bg-emerald-50" : "bg-white"
                }`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {item.lead_name ?? item.name ?? item.phone}
                  </span>
                  {item.unread > 0 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 text-[10px] font-semibold text-white">
                      {item.unread}
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs text-zinc-500">
                  {item.last_message ?? "Sin mensajes"}
                </span>
              </button>
            ))
          )}
        </aside>

        <div className="flex min-h-[420px] flex-col">
          {selectedId ? (
            <>
              <div className="max-h-[360px] flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.direction === "out"
                        ? "ml-auto bg-emerald-600 text-white"
                        : "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    {message.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form
                onSubmit={(event) => void sendMessage(event)}
                className="border-t border-zinc-100 p-3"
              >
                {error && <p className="mb-2 text-xs text-red-700">{error}</p>}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={
                      connected
                        ? "Escribí y Enter para enviar…"
                        : "Conectá WhatsApp para responder desde acá"
                    }
                    className="min-h-11 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="self-end rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="m-auto px-6 text-center text-sm text-zinc-500">
              Elegí un chat o tocá “Chat” en un lead de la tabla.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
