import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function PowerLayout(ctx: DemoLayoutContext) {
  return (
    <div
      className="min-h-full bg-black text-white"
      style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} tone="dark" internal={ctx.internal} />

      <section className="relative min-h-[95vh]">
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[95vh] max-w-6xl flex-col justify-center px-5">
          <p className="text-lg tracking-[0.4em] text-[#c8f542]">{ctx.rubro}</p>
          <h1 className="mt-2 text-6xl leading-[0.8] sm:text-8xl md:text-[10rem]">
            ENTRENÁ
            <br />
            <span className="text-[#c8f542]">HOY</span>
          </h1>
          <p
            className="mt-6 max-w-md text-base font-normal tracking-normal text-white/75"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {ctx.tagline}
          </p>
          <a
            href={ctx.waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex w-fit bg-[#c8f542] px-8 py-4 text-2xl tracking-wide text-black"
          >
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>

      {ctx.stats.length > 0 && (
        <section className="grid border-y border-white/10 md:grid-cols-3">
          {ctx.stats.map((stat) => (
            <div key={stat.label} className="border-white/10 px-6 py-10 text-center md:border-r last:border-r-0">
              <p className="text-6xl text-[#c8f542] md:text-7xl">{stat.value}</p>
              <p className="mt-2 text-lg tracking-[0.25em] text-white/50">{stat.label}</p>
            </div>
          ))}
        </section>
      )}

      {ctx.gallery.length > 0 && (
        <section className="grid md:grid-cols-3">
          {ctx.gallery.map((src, i) => (
            <div key={src} className="relative h-64 md:h-[420px]">
              <Photo src={src} alt={`${ctx.name} ${i + 1}`} className="absolute inset-0 h-full w-full" />
            </div>
          ))}
        </section>
      )}

      <section id="servicios" className="py-4">
        {ctx.services.map((service, index) => (
          <article
            key={service.title}
            className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-8 md:flex-row md:items-center md:px-12"
          >
            <div className="flex items-center gap-6">
              <span className="text-5xl text-[#c8f542]">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-4xl md:text-5xl">{service.title}</h3>
                <p
                  className="mt-1 text-sm font-normal tracking-normal text-white/50"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {service.detail}
                </p>
              </div>
            </div>
            <p className="text-2xl text-[#c8f542]">{service.price}</p>
          </article>
        ))}
      </section>

      {ctx.testimonials.length > 0 && (
        <section className="bg-[#c8f542] px-5 py-16 text-black">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {ctx.testimonials.map((item) => (
              <blockquote key={item.author}>
                <p className="text-3xl leading-tight">{item.quote}</p>
                <footer
                  className="mt-4 text-sm font-bold tracking-normal"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {item.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section id="contacto" className="px-5 py-20 text-center">
        <h2 className="text-6xl md:text-8xl">PRIMERA CLASE</h2>
        <p
          className="mx-auto mt-4 max-w-md text-sm font-normal tracking-normal text-white/60"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {ctx.address}
          <br />
          {ctx.hours.join(" · ")}
        </p>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex bg-[#c8f542] px-10 py-4 text-3xl text-black"
        >
          {ctx.ctaPrimary}
        </a>
      </section>

      <footer className="border-t border-white/10 px-5 py-6 text-center text-sm tracking-widest text-white/30">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
