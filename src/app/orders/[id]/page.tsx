import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { ArrowLeft, Package, Calendar, Clock, MapPin, Store, Truck, CreditCard } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailsPage({ params }: { params: { id: string } }) {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
        redirect("/login");
    }

    const { id } = await params;

    // Fetch Order with items
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
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

    // Security check: Only allow the user who made the order to view it
    if (order.userId !== sessionUser.id) {
        notFound();
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'COMPLETED': return 'Completado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 font-sans text-zinc-900">
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors mb-6 bg-blue-50 px-4 py-2 rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a mis pedidos
                    </Link>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-blue-600" />
                                Pedido #{order.id.slice(-6).toUpperCase()}
                            </h1>
                            <p className="text-zinc-600 font-medium mt-2 text-lg capitalize">
                                Realizado el {new Date(order.createdAt).toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-zinc-100 pb-4">Detalle de Productos</h2>
                    
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-4 border-b border-zinc-50 last:border-0">
                                <div className="flex items-start gap-4">
                                    <div className="bg-zinc-100 text-slate-800 font-black px-4 py-2 rounded-xl border border-zinc-200 text-lg">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-xl leading-tight">{item.product.name}</p>
                                        <p className="text-zinc-500 text-base font-medium mt-1">${Number(item.price).toLocaleString("es-AR")} c/u</p>
                                    </div>
                                </div>
                                <div className="font-black text-xl text-slate-900">
                                    ${(item.quantity * Number(item.price)).toLocaleString("es-AR")}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-end bg-zinc-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-3xl">
                        <span className="text-lg font-bold text-zinc-500 uppercase tracking-wider">Total abonado</span>
                        <span className="text-4xl font-black text-green-700">
                            ${Number(order.total).toLocaleString("es-AR")}
                        </span>
                    </div>
                </div>

                {/* Information blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 text-xl">
                            <Store className="w-6 h-6 text-blue-600" />
                            Sucursal
                        </h3>
                        <p className="font-black text-slate-800 text-2xl capitalize">{order.store}</p>
                        <p className="text-zinc-600 font-medium text-base mt-2">El pedido está procesándose en esta sucursal.</p>
                    </div>

                    <div className="bg-green-50 rounded-3xl p-6 md:p-8 shadow-sm border border-green-200">
                        <h3 className="font-bold text-green-900 flex items-center gap-2 mb-4 text-xl">
                            <CreditCard className="w-6 h-6 text-green-700" />
                            Pago
                        </h3>
                        <p className="font-black text-green-900 text-2xl">Efectivo al recibir</p>
                        <p className="text-green-800 font-medium text-base mt-2">El pago se realiza en el momento de la entrega o retiro.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
