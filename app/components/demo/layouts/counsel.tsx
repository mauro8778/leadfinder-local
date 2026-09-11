import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function CounselLayout(ctx: DemoLayoutContext) {
  return (
    <div className="min-h-full overflow-x-hidden bg-[#0b1524] text-[#f4efe4]" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} tone="dark" internal={ctx.internal} />
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:min-h-[85vh] lg:px-14">
          <p className="text-[11px] tracking-[0.35em] text-[#c4a35a] uppercase">{ctx.rubro}</p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {ctx.name}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">{ctx.tagline}</p>
          <a href={ctx.waLink} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit bg-[#c4a35a] px-6 py-3 text-sm font-semibold text-[#0b1524]">
            {ctx.ctaPrimary}
          </a>
        </div>
        <div className="relative min-h-[280px] sm:min-h-[380px] lg:min-h-full">
          <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="absolute inset-0 h-full w-full" />
        </div>
      </section>
      <section id="servicios" className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-3xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Áreas de práctica</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="border border-white/10 p-5">
              <h3 className="text-lg text-[#c4a35a]">{service.title}</h3>
              <p className="mt-2 text-sm text-white/60">{service.detail}</p>
              {service.price && <p className="mt-3 text-xs tracking-widest uppercase">{service.price}</p>}
            </article>
          ))}
        </div>
      </section>
      {ctx.gallery.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3">
          {ctx.gallery.map((src, i) => (
            <Photo key={src} src={src} alt={`${ctx.name} ${i + 1}`} className="h-52 w-full sm:h-72" />
          ))}
        </section>
      )}
      <section id="contacto" className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm text-white/60">{ctx.address}</p>
        <ul className="mt-3 space-y-1 text-sm text-white/50">{ctx.hours.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/40">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
