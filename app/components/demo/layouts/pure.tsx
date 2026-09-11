import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function PureLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;

  return (
    <div
      className="min-h-full bg-[#fafbfc] text-[#1a2a30]"
      style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-8">
        <p className="text-[13px] font-light tracking-[0.35em] uppercase">{ctx.name}</p>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] font-medium tracking-wide text-[#0e7490] underline underline-offset-8"
        >
          {ctx.ctaPrimary}
        </a>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-8 text-center">
        <p className="text-[11px] tracking-[0.4em] text-[#0e7490] uppercase">{ctx.rubro}</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
          Sonrisas cuidadas
          <br />
          con precisión digital
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed font-light text-zinc-500">
          {ctx.tagline}
        </p>
      </section>

      <section className="mx-auto flex max-w-5xl justify-center px-5 py-6">
        <Photo
          src={g1 ?? ctx.heroImage}
          alt={ctx.heroImageAlt}
          className="h-72 w-72 rounded-full md:h-[420px] md:w-[420px]"
        />
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-5 py-10 md:grid-cols-2">
        <Photo src={ctx.heroImage} alt="Consultorio" className="h-64 w-full rounded-sm md:h-80" />
        {g2 && <Photo src={g2} alt="Clínica" className="h-64 w-full rounded-sm md:h-80" />}
      </section>

      <section id="servicios" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center text-xs tracking-[0.35em] text-[#0e7490] uppercase">
          Tratamientos
        </h2>
        <div className="mt-10">
          {ctx.services.map((service, index) => (
            <article
              key={service.title}
              className="grid gap-2 border-t border-zinc-200 py-7 last:border-b md:grid-cols-[48px_1fr_auto] md:items-baseline"
            >
              <span className="text-xs text-zinc-400">0{index + 1}</span>
              <div>
                <h3 className="text-lg font-light">{service.title}</h3>
                <p className="mt-1 text-sm font-light text-zinc-500">{service.detail}</p>
              </div>
              <p className="text-sm text-[#0e7490]">{service.price}</p>
            </article>
          ))}
        </div>
      </section>

      {ctx.stats.length > 0 && (
        <section className="mx-auto grid max-w-3xl grid-cols-3 gap-8 px-5 py-8 text-center">
          {ctx.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-light text-[#0e7490]">{stat.value}</p>
              <p className="mt-1 text-[11px] tracking-widest text-zinc-400 uppercase">{stat.label}</p>
            </div>
          ))}
        </section>
      )}

      {ctx.testimonials.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="text-2xl font-light leading-relaxed md:text-3xl">
            “{ctx.testimonials[0].quote}”
          </p>
          <p className="mt-4 text-xs tracking-[0.25em] text-[#0e7490] uppercase">
            {ctx.testimonials[0].author}
          </p>
          {g3 && (
            <Photo src={g3} alt="Atención" className="mx-auto mt-12 h-48 w-full max-w-xl rounded-sm" />
          )}
        </section>
      )}

      <section id="contacto" className="mx-auto max-w-3xl px-5 pb-20 text-center">
        <h2 className="text-3xl font-light">Primera consulta</h2>
        <p className="mt-3 text-sm font-light text-zinc-500">{ctx.address}</p>
        <p className="mt-1 text-sm font-light text-zinc-500">{ctx.hours.join(" · ")}</p>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex border border-[#1a2a30] px-8 py-3 text-xs tracking-[0.25em] uppercase"
        >
          {ctx.ctaPrimary}
        </a>
      </section>

      <footer className="px-5 py-8 text-center text-[11px] tracking-widest text-zinc-400 uppercase">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
