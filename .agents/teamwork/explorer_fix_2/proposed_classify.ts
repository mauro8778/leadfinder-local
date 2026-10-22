import type { LeadClassification } from "./types";

const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "tiktok.com",
  "wa.me",
  "api.whatsapp.com",
  "linktr.ee",
  "beacons.ai",
  "cafecito.app",
  "pedidosya.com.ar",
  "rappi.com.ar",
  "x.com",
  "twitter.com",
  "linkedin.com",
  "threads.net",
  "youtube.com",
  "youtu.be",
];

function isSocialHost(host: string): boolean {
  return SOCIAL_HOSTS.some((social) => host === social || host.endsWith("." + social));
}

function extractFallbackHost(value: string): string {
  const authority = value
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/^\/\//, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0];
  const hostPart = authority.includes("@") ? (authority.split("@").pop() ?? "") : authority;
  return hostPart.split(":")[0].toLowerCase();
}

export function classifyWebsite(website: string | null | undefined): LeadClassification {
  if (!website || typeof website !== "string" || !website.trim()) {
    return "sin_web";
  }

  const value = website.trim().toLowerCase();

  // Social handles e.g. @comercio
  if (value.startsWith("@")) {
    return "solo_redes";
  }

  try {
    const url = value.startsWith("http://") || value.startsWith("https://")
      ? new URL(value)
      : new URL(`https://${value}`);
    const host = url.hostname.replace(/^www\./, "");

    if (isSocialHost(host)) {
      return "solo_redes";
    }

    return "tiene_web";
  } catch {
    const fallbackHost = extractFallbackHost(value);

    if (isSocialHost(fallbackHost)) {
      return "solo_redes";
    }

    return value.length > 3 ? "tiene_web" : "desconocido";
  }
}
