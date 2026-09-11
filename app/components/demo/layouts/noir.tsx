import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function NoirLayout(ctx: DemoLayoutContext) {
  return (
    <div
      className="min-h-full bg-black text-[#f3efe4]"
      style={{ fontFamily: '"Oswald", Impact, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} tone="dark" internal={ctx.internal} />

      <section className="relative min-h-[92vh] overflow-hidden">
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16">
          <p className="text-xs tracking-[0.5em] text-[#c9a227] uppercase">{ctx.rubro} · Merlo</p>
          <h1 className="mt-3 text-5xl leading-[0.85] font-semibold uppercase sm:text-7xl md:text-[8rem]">
            {ctx.name.split(" ")[0]}
          </h1>
          <p
            className="mt-4 max-w-lg text-base font-normal tracking-normal text-white/70"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {ctx.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noreferrer"
              className="bg-[#c9a227] px-6 py-3 text-xs tracking-[0.25em] text-black uppercase"
            >
              {ctx.ctaPrimary}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${ctx.mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="border border-white/30 px-6 py-3 text-xs tracking-[0.25em] uppercase"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {ctx.gallery.length > 0 && (
        <section className="grid h-[280px] grid-cols-3 md:h-[380px]">
          {ctx.gallery.map((src, i) => (
            <Photo key={src} src={src} alt={`${ctx.name} ${i + 1}`} className="h-full w-full" />
          ))}
        </section>
      )}

      <section id="servicios" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-5xl tracking-tight uppercase">Servicios</h2>
        <div className="mt-12 grid gap-px bg-[#c9a227]/30 sm:grid-cols-2">
          {ctx.services.map((service, index) => (
            <article key={service.title} className="bg-black p-8">
              <p className="text-4xl text-[#c9a227]">0{index + 1}</p>
              <h3 className="mt-4 text-2xl uppercase">{service.title}</h3>
              <p
                className="mt-3 text-sm font-normal leading-relaxed text-white/55"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {service.detail}
              </p>
              {service.price && <p className="mt-4 text-sm text-[#c9a227]">{service.price}</p>}
            </article>
          ))}
        </div>
      </section>

      {ctx.stats.length > 0 && (
        <section className="border-y border-[#c9a227]/40 bg-[#111] py-10">
          <div className="mx-auto grid max-w-5xl grid-cols-3 text-center">
            {ctx.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl text-[#c9a227] md:text-5xl">{stat.value}</p>
                <p className="mt-1 text-[10px] tracking-[0.3em] uppercase text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="contacto" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl uppercase">Turnos</h2>
            <ul
              className="mt-6 space-y-2 text-sm text-white/60"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {ctx.hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/60" style={{ fontFamily: "system-ui, sans-serif" }}>
              {ctx.address}
            </p>
          </div>
          {ctx.testimonials[0] && (
            <blockquote className="border-l-2 border-[#c9a227] pl-6">
              <p className="text-3xl leading-tight uppercase">“{ctx.testimonials[0].quote}”</p>
              <footer className="mt-4 text-xs tracking-widest text-[#c9a227] uppercase">
                {ctx.testimonials[0].author}
              </footer>
            </blockquote>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-[10px] tracking-[0.3em] uppercase text-white/30">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
