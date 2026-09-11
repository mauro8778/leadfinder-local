import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function FolioLayout(ctx: DemoLayoutContext) {
  return (
    <div className="min-h-full overflow-x-hidden bg-[#eef3ef] text-[#1c2b24]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <p className="text-xs font-extrabold tracking-[0.25em] text-emerald-700 uppercase">Cuentas para pymes</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          La caja, el IVA y los reportes. Sin planilla eterna.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-[#4d5f56] sm:text-base">{ctx.tagline}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={ctx.waLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-extrabold text-white">
            {ctx.ctaPrimary}
          </a>
          <span className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-sm">Desde $890.000</span>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-3 px-5 sm:grid-cols-3">
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="h-56 w-full rounded-3xl sm:col-span-2 sm:h-80" />
        {ctx.gallery[0] && <Photo src={ctx.gallery[0]} alt="Reportes" className="h-56 w-full rounded-3xl sm:h-80" />}
      </section>
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold">{service.title}</h3>
              <p className="mt-2 text-sm text-[#4d5f56]">{service.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="contacto" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-[2rem] bg-emerald-800 p-6 text-white sm:p-10">
          <h2 className="text-2xl font-extrabold">Pedí una demo</h2>
          <p className="mt-2 text-sm text-white/80">{ctx.hours.join(" · ")}</p>
          <a href={ctx.waLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-emerald-800">
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>
      <footer className="px-5 py-8 text-center text-xs text-[#6b7c74]">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
