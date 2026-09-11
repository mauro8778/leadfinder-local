import type { DemoDesignId } from "@/lib/demo-themes";
import { renderDemoLayout } from "./demo/layouts";

export interface DemoService {
  title: string;
  detail: string;
  price?: string;
}

export interface DemoStat {
  value: string;
  label: string;
}

export interface DemoTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface DemoLandingProps {
  design: DemoDesignId;
  name: string;
  tagline: string;
  rubro: string;
  accent: string;
  accentMuted: string;
  heroImage: string;
  heroImageAlt: string;
  gallery?: string[];
  services: DemoService[];
  hours: string[];
  address: string;
  whatsappPhone: string;
  whatsappText: string;
  ctaPrimary?: string;
  stats?: DemoStat[];
  highlights?: string[];
  testimonials?: DemoTestimonial[];
  internal?: boolean;
}

export function DemoLanding(props: DemoLandingProps) {
  const waLink = `https://wa.me/${props.whatsappPhone}?text=${encodeURIComponent(props.whatsappText)}`;
  const mapsQuery = encodeURIComponent(props.address);

  return renderDemoLayout({
    ...props,
    ctaPrimary: props.ctaPrimary ?? "Contactar por WhatsApp",
    stats: props.stats ?? [],
    highlights: props.highlights ?? [],
    testimonials: props.testimonials ?? [],
    gallery: props.gallery ?? [],
    internal: props.internal ?? false,
    waLink,
    mapsQuery,
  });
}
