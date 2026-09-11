import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function EditorialLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;

  return (
    <div
      className="min-h-full bg-[#f4eee6] text-[#2a2118]"
      style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <p
          className="text-xl italic"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {ctx.name}
        </p>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="border border-[#2a2118] px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
        >
          {ctx.ctaPrimary}
        </a>
      </header>

      <section className="grid min-h-[70vh] lg:grid-cols-12">
        <div className="relative min-h-[420px] lg:col-span-7">
          <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 lg:col-span-5 lg:px-12">
          <p className="text-[11px] tracking-[0.35em] text-[#b0894a] uppercase">{ctx.rubro}</p>
          <h1
            className="mt-4 text-5xl leading-[1.05] md:text-6xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Belleza
            <br />
            <span className="italic text-[#b0894a]">con criterio</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#6b5b4d]">{ctx.tagline}</p>
          <ul className="mt-8 space-y-2 text-sm text-[#6b5b4d]">
            {ctx.highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-px w-6 bg-[#b0894a]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {ctx.gallery.length > 0 && (
        <section className="grid gap-2 p-2 md:grid-cols-3">
          {[g1, g2, g3].filter(Boolean).map((src, i) => (
            <Photo
              key={src}
              src={src}
              alt={`${ctx.name} ${i + 1}`}
              className="h-64 w-full md:h-80"
            />
          ))}
        </section>
      )}

      <section id="servicios" className="mx-auto max-w-5xl px-5 py-20">
        <p className="text-[11px] tracking-[0.3em] text-[#b0894a] uppercase">Lookbook</p>
        <h2
          className="mt-2 text-3xl md:text-4xl"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          Tratamientos
        </h2>
        <div className="mt-12 divide-y divide-[#e4d8c8]">
          {ctx.services.map((service, index) => (
            <article key={service.title} className="grid gap-4 py-8 md:grid-cols-12 md:items-baseline">
              <span className="text-xs tracking-widest text-[#b0894a] md:col-span-1">
                0{index + 1}
              </span>
              <h3
                className="text-2xl md:col-span-4"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#6b5b4d] md:col-span-5">{service.detail}</p>
              <p className="text-sm md:col-span-2 md:text-right">{service.price}</p>
            </article>
          ))}
        </div>
      </section>

      {ctx.testimonials.length > 0 && (
        <section className="bg-[#2a2118] px-5 py-20 text-[#f4eee6]">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            {ctx.testimonials.map((item) => (
              <blockquote key={item.author}>
                <p
                  className="text-2xl leading-snug italic"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  “{item.quote}”
                </p>
                <footer className="mt-4 text-[11px] tracking-[0.2em] uppercase text-[#b0894a]">
                  {item.author} · {item.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section id="contacto" className="mx-auto grid max-w-5xl gap-10 px-5 py-20 md:grid-cols-2">
        <div>
          <h2
            className="text-3xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Reservá tu turno
          </h2>
          <p className="mt-3 text-sm text-[#6b5b4d]">{ctx.address}</p>
          <ul className="mt-4 space-y-1 text-sm text-[#6b5b4d]">
            {ctx.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center border border-[#2a2118] p-8">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#b0894a]">WhatsApp</p>
          <p className="mt-3 text-sm">Escribinos y coordinamos horario sin formularios.</p>
          <a
            href={ctx.waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-fit bg-[#2a2118] px-6 py-3 text-xs tracking-[0.2em] text-[#f4eee6] uppercase"
          >
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>

      <footer className="border-t border-[#e4d8c8] px-5 py-8 text-center text-xs text-[#8a7a6a]">
        <p style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{ctx.name}</p>
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
