import { getDashboardStats } from "@/actions/get-dashboard-stats";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return <DashboardClient initialStats={stats} />;
}
