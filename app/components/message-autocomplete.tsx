"use client";

import { useMemo, useState } from "react";
import {
  filterSuggestions,
  type MessageSuggestion,
} from "@/lib/message-suggestions";

const KIND_LABEL: Record<MessageSuggestion["kind"], string> = {
  paquete: "Paquete",
  extra: "Extra",
  frase: "Frase",
};

export function MessageAutocomplete({
  extraNote,
  onPick,
  onAddNote,
}: {
  extraNote: string;
  onPick: (item: MessageSuggestion) => void;
  onAddNote: (note: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => filterSuggestions(query), [query]);

  function apply(item: MessageSuggestion) {
    onPick(item);
    setQuery("");
    setOpen(false);
  }

  function addFreeText() {
    const text = query.trim();
    if (!text) {
      return;
    }
    const match = suggestions[0];
    if (match && query.trim().length >= 2) {
      apply(match);
      return;
    }
    onAddNote(text);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="flex flex-col gap-1 text-sm">
        Sumar al mensaje
        <input
          className="rounded-lg border border-zinc-300 px-3 py-2"
          value={query}
          placeholder="Escribí landing, turnos, chat, esta semana…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addFreeText();
            }
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </label>
      <p className="mt-1 text-xs text-zinc-500">
        Autocompleta paquetes, extras y frases. Enter suma lo primero de la
        lista, o tu texto si no hay coincidencia.
      </p>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-emerald-50"
                onMouseDown={(event) => {
                  event.preventDefault();
                  apply(item);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </span>
                <span className="line-clamp-2 text-xs text-zinc-500">{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {extraNote && (
        <div className="mt-2 flex items-start justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
          <p>{extraNote}</p>
          <button
            type="button"
            className="shrink-0 font-medium underline"
            onClick={() => onAddNote("")}
          >
            Sacar
          </button>
        </div>
      )}
    </div>
  );
}
