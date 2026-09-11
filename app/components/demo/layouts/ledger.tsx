import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function LedgerLayout(ctx: DemoLayoutContext) {
  return (
    <div className="min-h-full overflow-x-hidden bg-[#f4f7f6] text-[#16332e]" style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <p className="text-sm font-semibold tracking-wide">{ctx.name}</p>
        <a href={ctx.waLink} target="_blank" rel="noreferrer" className="rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white">
          {ctx.ctaPrimary}
        </a>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-[#0f766e] uppercase">Estudio contable</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Números claros.<br />Decisiones simples.</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#4b635e]">{ctx.tagline}</p>
        </div>
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="h-64 w-full rounded-2xl sm:h-80 lg:h-[420px]" />
      </section>
      {ctx.stats.length > 0 && (
        <section className="mx-auto mb-8 grid max-w-6xl grid-cols-3 gap-3 px-5">
          {ctx.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-4 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#0f766e] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[10px] tracking-wide text-[#6b7f7a] uppercase sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </section>
      )}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {ctx.services.map((service, i) => (
            <article key={service.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <span className="text-sm font-semibold text-[#0f766e]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-semibold">{service.title}</h3>
                <p className="mt-1 text-sm text-[#4b635e]">{service.detail}</p>
                {service.price && <p className="mt-2 text-xs text-[#0f766e]">{service.price}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="contacto" className="bg-[#0f766e] px-5 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold">Escribinos</h2>
          <p className="mt-2 text-sm text-white/80">{ctx.address}</p>
          <p className="mt-1 text-sm text-white/70">{ctx.hours.join(" · ")}</p>
        </div>
      </section>
      <footer className="px-5 py-8 text-center text-xs text-[#6b7f7a]">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
