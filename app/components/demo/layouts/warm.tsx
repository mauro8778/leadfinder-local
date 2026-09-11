import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function WarmLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;

  return (
    <div
      className="min-h-full bg-[#f7f0e6] text-[#3d2a1d]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />

      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span
          className="text-2xl italic"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          {ctx.name}
        </span>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#c2410c] px-5 py-2 text-sm font-bold text-white"
        >
          {ctx.ctaPrimary}
        </a>
      </nav>

      <section className="mx-auto grid max-w-5xl gap-3 px-5 pb-8 md:grid-cols-3 md:grid-rows-2">
        <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] md:col-span-2 md:row-span-2 md:min-h-[520px]">
          <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d2a1d]/80 to-transparent" />
          <div className="absolute bottom-0 p-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase text-[#fdba74]">{ctx.rubro}</p>
            <h1
              className="mt-2 text-4xl md:text-5xl"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Café de especialidad
              <br />
              en la plaza
            </h1>
          </div>
        </div>
        {g1 && (
          <div className="relative min-h-[180px] overflow-hidden rounded-[2rem]">
            <Photo src={g1} alt="Interior" className="absolute inset-0 h-full w-full" />
          </div>
        )}
        {g2 && (
          <div className="relative min-h-[180px] overflow-hidden rounded-[2rem]">
            <Photo src={g2} alt="Café" className="absolute inset-0 h-full w-full" />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8 text-center">
        <p
          className="text-xl leading-relaxed text-[#6b4f3a] md:text-2xl"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          {ctx.tagline}
        </p>
      </section>

      <section id="servicios" className="mx-auto max-w-3xl px-5 py-12">
        <h2
          className="text-center text-4xl"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          Carta
        </h2>
        <div className="mt-10 space-y-6">
          {ctx.services.map((service) => (
            <article key={service.title}>
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-extrabold">{service.title}</h3>
                <span className="flex-1 border-b border-dotted border-[#c4a484]" />
                <span className="text-[#c2410c]">{service.price}</span>
              </div>
              <p className="mt-1 text-sm text-[#7a5c45]">{service.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {g3 && (
        <section className="relative mx-5 my-8 overflow-hidden rounded-[2rem] md:mx-auto md:max-w-5xl">
          <Photo src={g3} alt="Pastelería" className="h-72 w-full md:h-96" />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#3d2a1d]/70 to-transparent p-8">
            <p className="text-2xl text-white" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
              Pastelería del día, horneada acá.
            </p>
          </div>
        </section>
      )}

      <section className="mx-auto my-12 max-w-5xl px-5">
        <div className="rounded-[2rem] bg-[#2b2118] p-8 text-[#f7f0e6] md:p-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#fdba74]">Pizarrón</p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
                Horarios
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-white/70">
                {ctx.hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
                Pedidos
              </h3>
              <p className="mt-3 text-sm text-white/70">{ctx.address}</p>
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full bg-[#c2410c] px-6 py-3 text-sm font-bold text-white"
              >
                {ctx.ctaPrimary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {ctx.testimonials.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            {ctx.testimonials.map((item) => (
              <blockquote key={item.author} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm leading-relaxed">{item.quote}</p>
                <footer className="mt-4 text-xs font-bold text-[#c2410c]">
                  {item.author} · {item.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <footer className="px-5 py-8 text-center text-xs text-[#8a6d55]">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
