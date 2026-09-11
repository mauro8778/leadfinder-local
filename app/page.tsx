import { getStats, listLeads } from "@/lib/db";
import { LeadDashboard } from "./components/lead-dashboard";

export const dynamic = "force-dynamic";

export default function Home() {
  const initialLeads = listLeads({ sinWebOnly: true, conTelefonoOnly: true });
  const initialStats = getStats();

  return (
    <LeadDashboard initialLeads={initialLeads} initialStats={initialStats} />
  );
}
