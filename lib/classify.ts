import type { LeadClassification } from "./types";

const SOCIAL_HOSTS = ["instagram.com", "facebook.com", "fb.com", "tiktok.com"];

export function classifyWebsite(website: string | null | undefined): LeadClassification {
  if (!website?.trim()) {
    return "sin_web";
  }

  const value = website.trim().toLowerCase();

  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(`https://${value}`);
    const host = url.hostname.replace(/^www\./, "");

    if (SOCIAL_HOSTS.some((social) => host.includes(social))) {
      return "solo_redes";
    }

    return "tiene_web";
  } catch {
    if (SOCIAL_HOSTS.some((social) => value.includes(social))) {
      return "solo_redes";
    }
    return value.length > 3 ? "tiene_web" : "desconocido";
  }
}
