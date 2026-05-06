import { getDashboardStats } from "@/actions/get-dashboard-stats";
import { getActiveCycle, getPastCycles } from "@/actions/admin/cycle-actions";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboard() {
    const stats = await getDashboardStats();
    const activeCycle = await getActiveCycle();
    const pastCycles = await getPastCycles(1);
    const latestClosedCycle = pastCycles.length > 0 ? pastCycles[0] : null;

    return <DashboardClient initialStats={stats} activeCycle={activeCycle} latestClosedCycle={latestClosedCycle} />;
}
