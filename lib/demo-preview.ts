export const DEMO_INTERNO_COOKIE = "lf_interno";
export const DEMO_INTERNO_QUERY = "interno";

export function isInternalQuery(
  value: string | string[] | undefined,
): boolean {
  if (Array.isArray(value)) return value.includes("1");
  return value === "1";
}

export function demoPreviewPath(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${DEMO_INTERNO_QUERY}=1`;
}
