"use client";

import Link from "next/link";
import { ShoppingBag, Calendar, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";

interface Order {
    id: string;
    createdAt: Date | string;
    status: string;
    total: number | string;
}

interface OrdersListProps {
    orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
    
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': 
                return {
                    label: 'Pendiente',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="w-6 h-6 text-yellow-600" />
                };
            case 'COMPLETED': 
                return {
                    label: 'Completado',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-6 h-6 text-green-600" />
                };
            case 'CANCELLED': 
                return {
                    label: 'Cancelado',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-6 h-6 text-red-600" />
                };
            default: 
                return {
                    label: status,
                    color: 'bg-zinc-100 text-zinc-800 border-zinc-200',
                    icon: <Clock className="w-6 h-6 text-zinc-600" />
                };
        }
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white p-12 text-center text-zinc-500 rounded-3xl shadow-sm border border-zinc-200">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                <p className="text-2xl font-black text-slate-900 mb-2">Aún no tienes pedidos.</p>
                <p className="text-zinc-600 text-lg">Tus próximas compras aparecerán aquí.</p>
                <Link href="/" className="inline-block mt-8 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                    Ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                
                return (
                    <Link href={`/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                
                                {/* Status & Date */}
                                <div className="flex items-start gap-5">
                                    <div className={`p-4 rounded-2xl border ${statusInfo.color} shrink-0 shadow-sm`}>
                                        {statusInfo.icon}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="font-black text-slate-900 text-xl">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-600 text-base font-medium">
                                            <Calendar className="w-5 h-5 text-zinc-400" />
                                            <span className="capitalize">{new Date(order.createdAt).toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-8 sm:border-l border-zinc-100 pt-4 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Total abonado</p>
                                        <p className="text-3xl font-black text-slate-900">
                                            ${Number(order.total).toLocaleString("es-AR")}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-zinc-50 group-hover:bg-blue-50 border border-transparent group-hover:border-blue-100 flex items-center justify-center transition-all">
                                        <ChevronRight className="w-7 h-7 text-zinc-400 group-hover:text-blue-600 transform group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
