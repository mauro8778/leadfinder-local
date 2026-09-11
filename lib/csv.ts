import type { Lead } from "./types";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportLeadsToCsv(leads: Lead[]): string {
  const headers = [
    "id",
    "name",
    "rubro",
    "zona",
    "address",
    "phone",
    "email",
    "classification",
    "status",
    "notes",
    "last_contacted_at",
    "sale_amount",
    "website",
    "created_at",
  ];

  const rows = leads.map((lead) =>
    [
      String(lead.id),
      lead.name,
      lead.rubro,
      lead.zona,
      lead.address ?? "",
      lead.phone ?? "",
      lead.email ?? "",
      lead.classification,
      lead.status,
      lead.notes ?? "",
      lead.last_contacted_at ?? "",
      lead.sale_amount != null ? String(lead.sale_amount) : "",
      lead.website ?? "",
      lead.created_at,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadLeadsCsv(leads: Lead[], filename = "leads.csv"): void {
  const csv = exportLeadsToCsv(leads);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
