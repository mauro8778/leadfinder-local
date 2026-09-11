import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function ClinicalLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;

  return (
    <div
      className="min-h-full bg-white text-[#123024]"
      style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />

      <div className="lg:grid lg:grid-cols-[88px_1fr]">
        <aside className="hidden bg-[#007a3d] text-white lg:flex lg:flex-col lg:items-center lg:gap-8 lg:py-8">
          <div className="relative h-10 w-10">
            <span className="absolute top-1/2 left-0 h-2 w-10 -translate-y-1/2 bg-white" />
            <span className="absolute top-0 left-1/2 h-10 w-2 -translate-x-1/2 bg-white" />
          </div>
          <p className="rotate-180 text-[11px] tracking-[0.4em] uppercase" style={{ writingMode: "vertical-rl" }}>
            {ctx.name}
          </p>
        </aside>

        <div>
          <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="relative h-7 w-7 text-[#007a3d]">
                <span className="absolute top-1/2 left-0 h-1.5 w-7 -translate-y-1/2 bg-current" />
                <span className="absolute top-0 left-1/2 h-7 w-1.5 -translate-x-1/2 bg-current" />
              </span>
              <span className="font-semibold">{ctx.name}</span>
            </div>
            <p className="hidden text-sm font-semibold lg:block">{ctx.name}</p>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[#007a3d] px-4 py-2 text-sm font-semibold text-white"
            >
              {ctx.ctaPrimary}
            </a>
          </header>

          <section className="grid items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:px-12 lg:py-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-[#007a3d] uppercase">
                Farmacia de barrio
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                Atención farmacéutica
                <br />
                clara y cercana
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600">{ctx.tagline}</p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {ctx.stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-[#eef8f1] p-3">
                    <p className="text-xl font-semibold text-[#007a3d]">{stat.value}</p>
                    <p className="text-[11px] text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <Photo
              src={ctx.heroImage}
              alt={ctx.heroImageAlt}
              className="h-72 w-full rounded-2xl md:h-[420px]"
            />
          </section>

          {ctx.gallery.length > 0 && (
            <section className="grid h-48 grid-cols-3 gap-2 px-5 lg:px-12">
              {[g1, g2, g3].filter(Boolean).map((src, i) => (
                <Photo
                  key={src}
                  src={src}
                  alt={`${ctx.name} ${i + 1}`}
                  className="h-full w-full rounded-xl"
                />
              ))}
            </section>
          )}

          <section id="servicios" className="px-5 py-16 lg:px-12">
            <h2 className="text-2xl font-semibold">Servicios</h2>
            <div className="mt-8 divide-y divide-zinc-100 border-y border-zinc-100">
              {ctx.services.map((service) => (
                <article key={service.title} className="grid gap-2 py-5 md:grid-cols-[1fr_2fr_auto] md:items-center">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm text-zinc-600">{service.detail}</p>
                  <p className="text-sm font-medium text-[#007a3d]">{service.price}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-5 mb-10 rounded-2xl bg-[#007a3d] px-6 py-8 text-white lg:mx-12">
            <p className="text-xs tracking-[0.2em] uppercase text-white/70">Obras sociales</p>
            <p className="mt-2 text-lg font-semibold">
              Atendemos las principales obras sociales y prepagas del GBA.
            </p>
          </section>

          {ctx.testimonials.length > 0 && (
            <section className="grid gap-4 px-5 pb-12 md:grid-cols-3 lg:px-12">
              {ctx.testimonials.map((item) => (
                <blockquote key={item.author} className="rounded-xl border border-zinc-100 p-5">
                  <p className="text-sm text-zinc-600">{item.quote}</p>
                  <footer className="mt-3 text-xs font-semibold text-[#007a3d]">{item.author}</footer>
                </blockquote>
              ))}
            </section>
          )}

          <section id="contacto" className="border-t border-zinc-100 px-5 py-12 lg:px-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold">Contacto y delivery</h2>
                <p className="mt-3 text-sm text-zinc-600">{ctx.address}</p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                  {ctx.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center">
                <a
                  href={ctx.waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-[#007a3d] px-6 py-3 text-sm font-semibold text-white"
                >
                  {ctx.ctaPrimary}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-zinc-100 px-5 py-6 text-center text-xs text-zinc-400">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
