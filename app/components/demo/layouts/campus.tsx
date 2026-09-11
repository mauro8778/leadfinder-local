import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function CampusLayout(ctx: DemoLayoutContext) {
  const [g1, g2, g3] = ctx.gallery;
  return (
    <div className="min-h-full overflow-x-hidden bg-[#f7f4ec] text-[#1e2a3a]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />
      <section className="relative min-h-[70vh] sm:min-h-[80vh]">
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1e2a3a]/70" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-end px-5 py-12 text-white sm:min-h-[80vh]">
          <p className="text-xs font-extrabold tracking-[0.3em] text-[#e3c36d] uppercase">{ctx.rubro}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">{ctx.name}</h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">{ctx.tagline}</p>
          <a href={ctx.waLink} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit rounded-full bg-[#e3c36d] px-6 py-3 text-sm font-extrabold text-[#1e2a3a]">
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-center text-3xl font-extrabold">Propuesta educativa</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold">{service.title}</h3>
              <p className="mt-2 text-sm text-[#5b6573]">{service.detail}</p>
              {service.price && <p className="mt-3 text-sm font-bold text-[#1e2a3a]">{service.price}</p>}
            </article>
          ))}
        </div>
      </section>
      {g1 && (
        <section className="grid gap-2 px-5 pb-10 sm:grid-cols-3">
          {[g1, g2, g3].filter(Boolean).map((src) => (
            <Photo key={src} src={src} alt={ctx.name} className="h-48 w-full rounded-2xl sm:h-64" />
          ))}
        </section>
      )}
      <section id="contacto" className="bg-[#1e2a3a] px-5 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <p>{ctx.address}</p>
          <p className="mt-2 text-sm text-white/70">{ctx.hours.join(" · ")}</p>
        </div>
      </section>
      <footer className="px-5 py-8 text-center text-xs text-[#7a7466]">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
