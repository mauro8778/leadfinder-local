import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function StructureLayout(ctx: DemoLayoutContext) {
  return (
    <div
      className="min-h-full bg-[#1a1c1f] text-[#e8eaed]"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      <div className="h-2 bg-[repeating-linear-gradient(90deg,#f5c518_0_16px,#111_16px_32px)]" />
      <DemoBanner rubro={ctx.rubro} tone="dark" internal={ctx.internal} />

      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p
            className="text-xs tracking-[0.3em] text-[#f5c518] uppercase"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            CAT-01
          </p>
          <p className="text-lg font-semibold">{ctx.name}</p>
        </div>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="bg-[#f5c518] px-4 py-2 text-xs font-bold tracking-wider text-black uppercase"
        >
          {ctx.ctaPrimary}
        </a>
      </header>

      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[380px]">
          <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
          <div className="absolute left-0 top-8 bg-[#f5c518] px-4 py-1 text-xs font-bold tracking-widest text-black uppercase">
            Stock · Zona oeste
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Materiales.
            <br />
            Herramientas.
            <br />
            <span className="text-[#f5c518]">Respuesta hoy.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">{ctx.tagline}</p>
          <ul
            className="mt-8 grid gap-2 text-xs tracking-wider uppercase"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {ctx.highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[#f5c518]">
                <span className="h-2 w-2 bg-[#f5c518]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {ctx.stats.length > 0 && (
        <section
          className="grid grid-cols-3 border-y border-white/10 bg-black/40"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {ctx.stats.map((stat) => (
            <div key={stat.label} className="border-r border-white/10 px-4 py-6 last:border-r-0">
              <p className="text-2xl text-[#f5c518] md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[10px] tracking-widest uppercase text-white/40">{stat.label}</p>
            </div>
          ))}
        </section>
      )}

      <section id="servicios" className="px-5 py-16">
        <p
          className="text-xs tracking-[0.3em] text-[#f5c518] uppercase"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          Catálogo
        </p>
        <h2 className="mt-2 text-3xl font-bold">Líneas de producto</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ctx.services.map((service, index) => {
            const img = ctx.gallery[index] ?? ctx.heroImage;
            return (
              <article key={service.title} className="grid overflow-hidden border border-white/10 bg-[#22252a] sm:grid-cols-5">
                <Photo src={img} alt={service.title} className="h-40 w-full sm:col-span-2 sm:h-full" />
                <div className="p-5 sm:col-span-3">
                  <p
                    className="text-[10px] tracking-widest text-[#f5c518] uppercase"
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    SKU-{String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm text-white/55">{service.detail}</p>
                  <p className="mt-3 text-sm font-semibold text-[#f5c518]">{service.price}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="contacto" className="grid md:grid-cols-2">
        <div className="bg-[#f5c518] px-6 py-14 text-black">
          <h2 className="text-3xl font-bold">Presupuesto por WhatsApp</h2>
          <p className="mt-3 text-sm">{ctx.address}</p>
          <ul className="mt-4 space-y-1 text-sm">
            {ctx.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a
            href={ctx.waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex bg-black px-6 py-3 text-sm font-bold text-[#f5c518] uppercase"
          >
            {ctx.ctaPrimary}
          </a>
        </div>
        <div className="space-y-6 px-6 py-14">
          {ctx.testimonials.map((item) => (
            <blockquote key={item.author} className="border-l-2 border-[#f5c518] pl-4">
              <p className="text-sm text-white/70">{item.quote}</p>
              <footer className="mt-2 text-xs font-semibold text-[#f5c518]">
                {item.author} · {item.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-6 text-center text-[10px] tracking-widest text-white/30 uppercase">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
