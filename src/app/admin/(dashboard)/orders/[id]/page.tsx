import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Trash2,
    User,
    MapPin,
    CreditCard,
    FileText,
    Phone,
    Mail,
    Calendar,
    Clock
} from "lucide-react";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import EditableOrderItems from "@/components/admin/EditableOrderItems";
import StoreSwitcher from "@/components/admin/StoreSwitcher";

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Fetch Order with relations
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Determine status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
        }
    };

    // Calculate total from items (to ensure accuracy regardless of order.total snapshot if needed, but let's use order.total for now as authoritative)
    const total = Number(order.total);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>
                {/* Delete button logic would need a client component or server action form. For now, visual. */}
                <DeleteOrderButton orderId={order.id} redirectTo="/admin/orders" />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Card 1: Order Details */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-semibold">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h2>Detalles del Pedido</h2>
                    </div>
                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex justify-between">
                            <span>ID Completo:</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200 text-xs">{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fecha:</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleDateString('es-AR')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Hora:</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-3">
                            <StoreSwitcher orderId={order.id} currentStore={order.store} />
                        </div>
                    </div>
                </div>

                {/* Card 2: Customer Details */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-semibold">
                        <User className="w-5 h-5 text-purple-500" />
                        <h2>Cliente</h2>
                    </div>
                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="font-medium text-lg text-zinc-900 dark:text-zinc-200">
                            {order.user?.name || 'Cliente Invitado / Sin Nombre'}
                        </div>

                        {order.user?.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-zinc-400" />
                                <span>{order.user.email}</span>
                            </div>
                        )}

                        {order.user?.username && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-400" />
                                <span>@{order.user.username}</span>
                            </div>
                        )}

                        {/* Phone and Address are not in User model yet (schema limitation). Listing as Missing/TBD. */}
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Phone className="w-4 h-4" />
                            <span>Teléfono no reg.</span>
                        </div>
                        <div className="flex items-start gap-2 text-zinc-400">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>Dirección no reg.</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Context / Payment */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-semibold">
                        <CreditCard className="w-5 h-5 text-green-500" />
                        <h2>Pago</h2>
                    </div>
                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex justify-between">
                            <span>Método de Pago:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Efectivo</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estado de Pago:</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200">Pendiente (al retirar)</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-500 text-xs rounded border border-yellow-100 dark:border-yellow-900/30">
                                Info: El cliente paga al momento de la entrega/retiro.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditableOrderItems 
                orderId={order.id} 
                items={order.items.map(item => ({
                    ...item,
                    price: item.price.toNumber(),
                    product: {
                        ...item.product,
                        price: item.product.price.toNumber(),
                        unitPrice: item.product.unitPrice ? item.product.unitPrice.toNumber() : null
                    }
                }))} 
                initialTotal={total} 
            />
        </div>
    );
}
