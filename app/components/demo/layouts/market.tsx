import { DemoBanner, DemoOwnerMark, Photo, WhatsAppFloat, type DemoLayoutContext } from "../shared";

export function MarketLayout(ctx: DemoLayoutContext) {
  return (
    <div className="min-h-full overflow-x-hidden bg-white text-zinc-900" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <DemoBanner rubro={ctx.rubro} internal={ctx.internal} />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <p className="text-sm font-semibold">{ctx.name}</p>
        <a href={ctx.waLink} target="_blank" rel="noreferrer" className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white">
          {ctx.ctaPrimary}
        </a>
      </header>
      <section className="relative mx-5 overflow-hidden rounded-[2rem] sm:mx-auto sm:max-w-6xl">
        <Photo src={ctx.heroImage} alt={ctx.heroImageAlt} className="h-[380px] w-full sm:h-[520px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white sm:p-10">
          <p className="text-xs tracking-[0.3em] uppercase text-white/70">Tienda online</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Tu catálogo, listo para vender.</h1>
          <p className="mt-3 max-w-lg text-sm text-white/80">{ctx.tagline}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid grid-cols-3 gap-3 text-center">
          {["Mercado Pago", "Stock", "Envíos GBA"].map((item) => (
            <div key={item} className="rounded-2xl bg-zinc-50 px-2 py-4 text-xs font-semibold sm:text-sm">{item}</div>
          ))}
        </div>
      </section>
      {ctx.gallery.length > 0 && (
        <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 sm:grid-cols-3">
          {ctx.gallery.map((src, i) => (
            <Photo key={src} src={src} alt={`Producto ${i + 1}`} className="h-40 w-full rounded-2xl sm:h-64" />
          ))}
        </section>
      )}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-semibold">Qué incluye</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ctx.services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-zinc-100 p-5">
              <h3 className="font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{service.detail}</p>
              {service.price && <p className="mt-2 text-sm font-medium">{service.price}</p>}
            </article>
          ))}
        </div>
      </section>
      <section id="contacto" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-[2rem] bg-zinc-900 p-6 text-white sm:p-10">
          <h2 className="text-2xl font-semibold">Ecommerce desde $520.000</h2>
          <p className="mt-2 text-sm text-white/70">Mantenimiento opcional $25.000/mes.</p>
          <a href={ctx.waLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900">
            {ctx.ctaPrimary}
          </a>
        </div>
      </section>
      <footer className="px-5 py-8 text-center text-xs text-zinc-400">
        {ctx.name}
        <DemoOwnerMark internal={ctx.internal} />
      </footer>
      <WhatsAppFloat waLink={ctx.waLink} />
    </div>
  );
}
