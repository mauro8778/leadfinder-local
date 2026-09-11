import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function PulseLayout(ctx: DemoLayoutContext) {
  return (
    <div className="min-h-full overflow-x-hidden bg-[#0b1020] text-white" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} tone="dark" internal={ctx.internal} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-300 uppercase">Sistema de ventas</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Vendé, cobrá y controlá el stock en un solo lugar.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">{ctx.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={ctx.waLink} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold">
              {ctx.ctaPrimary}
            </a>
            <span className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/70">Desde $780.000</span>
          </div>
        </div>
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="h-64 w-full rounded-3xl sm:h-80 lg:h-[440px]" />
      </section>
      {ctx.stats.length > 0 && (
        <section className="border-y border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-3 px-5 py-8">
            {ctx.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-indigo-300 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-[10px] tracking-widest text-white/40 uppercase sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm text-white/60">{service.detail}</p>
            </article>
          ))}
        </div>
      </section>
      {ctx.gallery.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3">
          {ctx.gallery.map((src, i) => (
            <Photo key={src} src={src} alt={`${ctx.name} ${i + 1}`} className="h-48 w-full sm:h-64" />
          ))}
        </section>
      )}
      <section id="contacto" className="px-5 py-14 text-center">
        <h2 className="text-3xl font-semibold">Probá el sistema</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/55">{ctx.address}</p>
        <a href={ctx.waLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-indigo-500 px-8 py-3 text-sm font-semibold">
          {ctx.ctaPrimary}
        </a>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/35">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
