import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import Link from 'next/link';
import OrdersFilter from "@/components/admin/OrdersFilter";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import { getCurrentCommunityRange, getPastCommunityRange } from "@/lib/community-cycle";

interface OrdersPageProps {
    searchParams: {
        cycle?: string;
        store?: string;
    }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ cycle?: string, store?: string }> }) {
    const { cycle = 'current', store = 'alsina' } = await searchParams;
    // If filtering by 'all', store might be undefined in params but we default to specific logic below

    let dateFilter = {};

    if (cycle === 'current') {
        const range = getCurrentCommunityRange();
        dateFilter = {
            createdAt: {
                gte: range.start,
                lte: range.end
            }
        };
    } else if (cycle === 'past') {
        const range = getPastCommunityRange();
        dateFilter = {
            createdAt: {
                gte: range.start,
                lt: range.end // Use 'lt' (less than) the start of current to be precise
            }
        };
    }
    // if cycle === 'all', no date filter

    let storeFilter = {};
    // Check explicit store update
    const resolvedParams = await searchParams;

    if (resolvedParams.store) {
        storeFilter = {
            store: resolvedParams.store
        };
    } else if (cycle !== 'all') {
        // If we are in "current" or "past" default tabs, we force a default store filter if none is present?
        // The UI defaults to 'Activa Alsina', so let's respect that URL.
        // If URL has no store but cycle is current, it means user manually navigated or default. 
        // But the Filter component manages the URL. 
        // Let's rely on what's in the URL, but if the URL params are empty, effectively it shows "All" or "Default"?
        // Best UX: If 'cycle' is set but 'store' is not, maybe show all stores for that cycle? 
        // The requirement was specific: "Activa Alsina", "Activa Malabia".
        // Let's strictly follow the URL params.
        // However, for the initial load, we might want a default redirect or state? 
        // For now, if no params, show ALL orders (safest fallback).
    }


    // Construct Where Clause
    const where = {
        ...dateFilter,
        ...storeFilter
    };

    // Fetch orders from database
    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true, // to get customer name
            items: true // to calculate items count if needed
        }
    });

    return (
        <div className="p-8">
            <PageHeader
                title="Pedidos"
                // No action button for Orders usually, but adding for consistency in template
                actionLabel="Crear Pedido"
                actionHref="/admin/orders/new"
            />

            <OrdersFilter />

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">ID Pedido</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                    No hay pedidos registrados para este filtro.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                        #{order.id.slice(0, 8).toUpperCase()}
                                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                                            {order.store === 'alsina' ? (
                                                <span className="text-blue-600 dark:text-blue-400">Alsina</span>
                                            ) : order.store === 'malabia' ? (
                                                <span className="text-purple-600 dark:text-purple-400">Malabia</span>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.user?.name || "Invitado"}
                                        <div className="text-xs text-zinc-400">{order.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                        <div className="text-xs text-zinc-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        ${order.total.toNumber().toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                            ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                                            ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                        `}>
                                            {order.status === 'PENDING' ? 'Pendiente' : order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/orders/${order.id}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                                Ver Detalles
                                            </Link>
                                            <DeleteOrderButton orderId={order.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
