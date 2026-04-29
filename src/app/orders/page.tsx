import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { OrdersList } from "@/components/orders-list";

export default async function OrdersPage() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        redirect("/login");
    }

    const orders = await prisma.order.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: 'desc' }
    });

    // Serialize Decimal to number for Client Component
    const serializedOrders = orders.map(order => ({
        ...order,
        total: order.total.toNumber()
    }));

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 font-sans">
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-500 bg-zinc-100"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-800" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-8 h-8 text-blue-600" />
                            Mis Pedidos
                        </h1>
                        <p className="text-zinc-600 font-medium text-lg">Historial de tus compras recientes</p>
                    </div>
                </div>

                <OrdersList orders={serializedOrders} />
            </div>
        </div>
    );
}
