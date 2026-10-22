import { getStats, listLeads } from "@/lib/db";
import { LeadDashboard } from "./components/lead-dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Obtenemos los leads y estadísticas iniciales de forma segura en el Server Component
  const [initialLeads, initialStats] = await Promise.all([
    listLeads({ sinWebOnly: true }),
    getStats(),
  ]);

  return (
    <LeadDashboard initialLeads={initialLeads} initialStats={initialStats} />
  );
}