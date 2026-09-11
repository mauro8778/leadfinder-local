import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function CareLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;

  return (
    <div
      className="min-h-full bg-[#f3f7f2] text-[#2d3a32]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3d8b6e] text-lg text-white">
            ♥
          </span>
          <span className="text-lg font-extrabold">{ctx.name}</span>
        </div>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#3d8b6e] px-5 py-2.5 text-sm font-extrabold text-white"
        >
          {ctx.ctaPrimary}
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-extrabold tracking-wide text-[#3d8b6e] uppercase">
            Cuidamos a tu familia
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-extrabold md:text-6xl">
            Medicina veterinaria
            <span className="text-[#3d8b6e]"> con calidez</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#5c6d62]">{ctx.tagline}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {ctx.highlights.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#3d8b6e] shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[#c8e6d4]" />
          <div className="absolute -bottom-6 -right-4 h-32 w-32 rounded-full bg-[#ffe8c8]" />
          <Photo
            src={ctx.heroImage}
            alt={ctx.heroImageAlt}
            className="relative h-[380px] w-full rounded-[3rem] shadow-xl md:h-[460px]"
          />
        </div>
      </section>

      {ctx.gallery.length > 0 && (
        <section className="mx-auto flex max-w-4xl justify-center gap-4 px-5 py-8">
          {[g1, g2, g3].filter(Boolean).map((src, i) => (
            <Photo
              key={src}
              src={src}
              alt={`Mascota ${i + 1}`}
              className={`h-28 w-28 rounded-full border-4 border-white shadow-md md:h-40 md:w-40 ${
                i === 1 ? "md:h-48 md:w-48" : ""
              }`}
            />
          ))}
        </section>
      )}

      <section id="servicios" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-extrabold">Cómo podemos ayudar</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="rounded-[2rem] bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-extrabold">{service.title}</h3>
                <span className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-bold text-[#3d8b6e]">
                  {service.price}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5c6d62]">{service.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {ctx.testimonials.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-3xl font-extrabold">Familias que confían</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {ctx.testimonials.map((item) => (
                <blockquote key={item.author} className="rounded-[2rem] bg-[#f3f7f2] p-6">
                  <p className="text-sm leading-relaxed">{item.quote}</p>
                  <footer className="mt-4 text-sm font-extrabold text-[#3d8b6e]">
                    {item.author}
                    <span className="block text-xs font-semibold text-[#5c6d62]">{item.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contacto" className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-[2.5rem] bg-[#3d8b6e] p-8 text-white md:p-12">
          <h2 className="text-3xl font-extrabold">Sacá turno hoy</h2>
          <p className="mt-3 text-white/85">{ctx.address}</p>
          <ul className="mt-4 space-y-1 text-sm text-white/80">
            {ctx.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a
            href={ctx.waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#3d8b6e]"
          >
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-xs text-[#7a8b80]">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
