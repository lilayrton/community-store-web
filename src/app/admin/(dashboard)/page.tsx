import { getDashboardStats } from "@/actions/get-dashboard-stats";
import { getActiveCycle } from "@/actions/admin/cycle-actions";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboard() {
    const stats = await getDashboardStats();
    const activeCycle = await getActiveCycle();

    return <DashboardClient initialStats={stats} activeCycle={activeCycle} />;
}
