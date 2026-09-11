import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_SITES } from "@/lib/demos";
import { demoPreviewPath } from "@/lib/demo-preview";

export const metadata: Metadata = {
  title: "Catálogo de demos",
  robots: { index: false, follow: false },
};

export default function DemoIndexPage() {
  return (
    <div className="min-h-full bg-[#0c0c0e] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-16">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
          ← Panel LeadFinder
        </Link>
        <p className="mt-10 text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Portfolio · {DEMO_SITES.length} estilos
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Cada rubro, un diseño distinto
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
          Sitios listos para mostrar por WhatsApp. Fotos reales del rubro y una
          identidad visual propia — no la misma plantilla con otro color.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_SITES.map((demo) => (
            <Link
              key={demo.id}
              href={demoPreviewPath(demo.path)}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
                <img
                  src={demo.previewImage}
                  alt={demo.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/15 to-transparent" />
                <span
                  className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white uppercase"
                  style={{ backgroundColor: demo.accent }}
                >
                  {demo.id}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-white">{demo.label}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-zinc-400">{demo.description}</p>
                <p className="mt-3 text-xs font-medium" style={{ color: demo.accent }}>
                  Ver sitio →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
