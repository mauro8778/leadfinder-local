"use client";

import { useMemo, useState } from "react";
import {
  ADDON_PLAYBOOKS,
  PACKAGE_PLAYBOOKS,
  playbooksForSelection,
  type SalesPlaybook,
} from "@/lib/sales-playbook";

function PlaybookCard({ item, open = false }: { item: SalesPlaybook; open?: boolean }) {
  return (
    <details
      open={open}
      className="rounded-xl border border-amber-200/80 bg-amber-50/60 open:bg-white"
    >
      <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
        <span className="mr-2 text-amber-700">★</span>
        {item.name}
      </summary>
      <div className="space-y-3 border-t border-amber-100 px-3 py-3 text-sm leading-relaxed text-zinc-700">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            Cómo lo vendés
          </p>
          <p className="mt-1">{item.sell}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            Si te frenan
          </p>
          <p className="mt-1">{item.ifTheySay}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            Cómo lo entregás
          </p>
          <p className="mt-1">{item.implement}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            Pediles esto
          </p>
          <p className="mt-1">{item.youNeed}</p>
        </div>
      </div>
    </details>
  );
}

export function SalesPlaybookPanel({
  pricingId,
  addonIds,
}: {
  pricingId: string;
  addonIds: string[];
}) {
  const [showAll, setShowAll] = useState(false);
  const selected = useMemo(
    () => playbooksForSelection(pricingId, addonIds),
    [pricingId, addonIds],
  );
  const packages = showAll || pricingId === "todos" || pricingId === "sin_precio"
    ? PACKAGE_PLAYBOOKS
    : selected.filter((item) => PACKAGE_PLAYBOOKS.some((pack) => pack.id === item.id));
  const addons = showAll
    ? ADDON_PLAYBOOKS
    : selected.filter((item) => ADDON_PLAYBOOKS.some((pack) => pack.id === item.id));

  return (
    <section className="rounded-2xl border border-amber-200 bg-[#fffaf0] p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-amber-800 uppercase">
            Solo vos · no va al WhatsApp
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Cómo venderlo y cómo lo armás
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Elegí un paquete y extras arriba. Acá tenés el discurso, las objeciones
            y la implementación para no trabarte en la llamada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="min-h-10 shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-950"
        >
          {showAll ? "Ver solo lo elegido" : "Ver todos los packs"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Paquete
          </p>
          {packages.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Elegí landing, sitio, tienda o sistema para ver la guía.
            </p>
          ) : (
            packages.map((item, index) => (
              <PlaybookCard key={item.id} item={item} open={index === 0 && !showAll} />
            ))
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Extras
          </p>
          {addons.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Marcá un extra (turnos, chat, carga de productos…) para ver cómo
              se vende y cómo se entrega.
            </p>
          ) : (
            addons.map((item, index) => (
              <PlaybookCard key={item.id} item={item} open={index === 0} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
