"use client";

import { useState, useEffect } from "react";
import {
    Store,
    ShoppingCart,
    DollarSign,
    Users,
    TrendingUp,
    MapPin,
    Megaphone,
    CheckSquare,
    Square,
    Trash2,
    Copy,
    Ticket,
    PackageX,
    UserPlus,
    Package,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    ChevronDown
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

type StagnantProduct = {
    id: string;
    name: string;
    price: number;
    categoryName: string;
};

// Types
type CustomerStat = {
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
};

type InactiveCustomer = {
    id: string;
    name: string;
    phone: string;
};

type DuplicateOrder = {
    id: string;
    customerName: string;
    value: number;
    time: string;
};

import { getDashboardStats } from "@/actions/get-dashboard-stats";
import { deleteOrder } from "@/actions/delete-order";
import CycleManager from "@/components/admin/CycleManager";

interface DashboardClientProps {
    activeCycle: any;
    latestClosedCycle?: any;
    initialStats: {
        totalOrders: number;
        totalSales: number;
        topCustomers: CustomerStat[];
        inactiveCustomers: InactiveCustomer[];
        duplicateOrders?: DuplicateOrder[];
        averageTicket?: number;
        stagnantProducts?: StagnantProduct[];
        newCustomers?: { id: string; name: string; email?: string | null; phone?: string | null; }[];
        cycleEndTime?: string | null;
        topProducts?: { id: string; name: string; count: number }[];
        totalUnits?: number;
        salesByCategory?: { name: string; value: number }[];
        ordersByHour?: { time: string; orders: number }[];
        customerRetention?: { name: string; value: number; fill: string }[];
    };
}

export default function DashboardClient({ initialStats, activeCycle, latestClosedCycle }: DashboardClientProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedStore, setSelectedStore] = useState<"alsina" | "malabia">("alsina");
    const [stats, setStats] = useState(initialStats);
    const [selectedInactive, setSelectedInactive] = useState<string[]>([]);
    const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats(selectedStore);
                setStats(data);
            } catch (error) {
                console.error("Failed to update stats:", error);
            }
        }
        if (isMounted) {
            fetchStats();
        }
    }, [selectedStore, isMounted]);

    // Update initialStats if page reloads or prop changes (sync)
    useEffect(() => {
        setStats(initialStats);
    }, [initialStats]);


    const toggleInactiveSelection = (id: string) => {
        setSelectedInactive(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // ... rest of the file
    // Helper handlers need to be inside the component scope if they use state (stats, etc)
    const toggleAllInactive = () => {
        if (!stats.inactiveCustomers) return; // guard

        if (selectedInactive.length === stats.inactiveCustomers.length) {
            setSelectedInactive([]);
        } else {
            setSelectedInactive(stats.inactiveCustomers.map(c => c.id));
        }
    };

    const handleBroadcast = () => {
        if (selectedInactive.length === 0) return;
        alert(`Difusión creada para ${selectedInactive.length} clientes. (Simulado)`);
        console.log("Broadcasting to:", selectedInactive);
    };

    const handleDeleteDuplicate = async (id: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este pedido duplicado? Esta acción no se puede deshacer.")) {
            const res = await deleteOrder(id);
            if (res.success) {
                // Optimistically update
                setStats(prev => ({
                    ...prev,
                    duplicateOrders: prev.duplicateOrders?.filter(o => o.id !== id)
                }));
            } else {
                alert("Error al eliminar pedido.");
            }
        }
    }

    if (!isMounted) {
        return <div className="p-8">Cargando...</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* Header & Store Selector */}
            <div className="flex flex-row items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="hidden md:block text-zinc-500 dark:text-zinc-400 mt-1 text-sm md:text-base">Resumen de actividad y estadísticas (Global)</p>
                </div>

                <div className="relative z-20">
                    <button
                        onClick={() => setIsStoreSelectorOpen(!isStoreSelectorOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-900 dark:text-zinc-200 outline-none"
                    >
                        <Store className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <span className="text-sm md:text-base font-medium">{selectedStore === 'alsina' ? 'Alsina' : 'Malabia'}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isStoreSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isStoreSelectorOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsStoreSelectorOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setSelectedStore("alsina");
                                            setSelectedInactive([]);
                                            setIsStoreSelectorOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedStore === 'alsina' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${selectedStore === 'alsina' ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-medium">Sucursal Alsina</p>
                                            <p className="text-xs opacity-70">Calle Alsina 1234</p>
                                        </div>
                                        {selectedStore === 'alsina' && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedStore("malabia");
                                            setSelectedInactive([]);
                                            setIsStoreSelectorOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedStore === 'malabia' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${selectedStore === 'malabia' ? 'bg-purple-100 dark:bg-purple-800/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-medium">Sucursal Malabia</p>
                                            <p className="text-xs opacity-70">Calle Malabia 5678</p>
                                        </div>
                                        {selectedStore === 'malabia' && (
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CycleManager activeCycle={activeCycle} latestClosedCycle={latestClosedCycle} />

            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Ventas Totales Card (takes 2 cols) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 md:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Ventas Totales
                            <DollarSign className="w-5 h-5 text-blue-500" />
                        </h3>
                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold rounded text-xs flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12.5%
                        </span>
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        ${stats.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Orders Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Pedidos Realizados
                            <ShoppingCart className="w-5 h-5 text-purple-500" />
                        </h3>
                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold rounded text-xs flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +5.2%
                        </span>
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        {stats.totalOrders}
                    </p>
                </div>

                {/* Average Ticket Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                Ticket Promedio
                                <Ticket className="w-5 h-5 text-teal-500" />
                            </h3>
                            <p className="text-xs text-zinc-400 font-medium">
                                Por pedido en este ciclo
                            </p>
                        </div>
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                        ${stats.averageTicket?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Categorías (Donut) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                        <PieChartIcon className="w-5 h-5 text-indigo-500" />
                        Ventas por Categoría
                    </h2>
                    <div className="h-[250px] w-full">
                        {stats.salesByCategory && stats.salesByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.salesByCategory}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.salesByCategory.map((entry, index) => {
                                            const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                        })}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any) => [`${value} unidades`, 'Ventas']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#71717a' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8">
                                <BarChartIcon className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm text-center">Aún no hay transacciones en esta comunitaria</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Retención (Donut) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-pink-500" />
                        Nuevos vs Recurrentes
                    </h2>
                    <div className="h-[250px] w-full">
                        {stats.customerRetention && stats.customerRetention.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.customerRetention}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.customerRetention.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any) => [`${value} clientes`, 'Cantidad']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#71717a' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8">
                                <BarChartIcon className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm text-center">Aún no hay transacciones en esta comunitaria</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Pedidos por Hora (Bar) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                        <BarChartIcon className="w-5 h-5 text-teal-500" />
                        Pedidos por Hora
                    </h2>
                    <div className="h-[250px] w-full">
                        {stats.ordersByHour && stats.ordersByHour.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.ordersByHour}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.15} />
                                    <XAxis 
                                        dataKey="time" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#71717a' }} 
                                        tickMargin={10}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#71717a' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f4f4f5' }}
                                        formatter={(value: any) => [`${value} pedidos`, 'Cantidad']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8">
                                <BarChartIcon className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm text-center">Aún no hay transacciones en esta comunitaria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Left Column Stack */}
                <div className="space-y-6">
                    {/* Top 10 Customers */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" />
                                Top 10 Clientes
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">Clientes que mas pidieron en la comunitaria actual</p>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-16 text-center">#</th>
                                        <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Cliente</th>
                                        <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Pedidos</th>
                                        <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {stats.topCustomers.map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    index === 1 ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                            'text-zinc-500 dark:text-zinc-500'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                                                {customer.name}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-200">
                                                    {customer.totalOrders}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-zinc-600 dark:text-zinc-400">
                                                ${customer.totalSpent.toLocaleString('es-AR')}
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.topCustomers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                No hay clientes con pedidos aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* New Customers List (Replaces "Potential Customers" card) */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-pink-50/30 dark:bg-pink-900/10">
                            <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-pink-500" />
                                Nuevos Clientes
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">1° Compra realizada en este ciclo</p>
                        </div>
                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Cliente</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {(stats.newCustomers || []).map((user) => (
                                        <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                                                {user.name}
                                                <div className="text-xs text-zinc-400">{user.email || "-"}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs">
                                                {user.phone || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!stats.newCustomers || stats.newCustomers.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                                    Sin clientes nuevos esta semana
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column Stack */}
                <div className="space-y-6">



                    {/* 3. Top Products Card (Top 10) */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/30 dark:bg-amber-900/10">
                            <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Top 10 Productos
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">Más vendidos de la semana</p>
                        </div>
                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-zinc-500 w-10 text-center">#</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Producto</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Cant.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {(stats.topProducts || []).map((product, index) => (
                                        <tr key={product.id || index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-xs font-bold text-zinc-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[180px]" title={product.name}>
                                                {product.name}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-amber-600 dark:text-amber-400">
                                                {product.count}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!stats.topProducts || stats.topProducts.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                                    Sin ventas aún
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Inactive Customers Block */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[300px]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-red-50/30 dark:bg-red-900/10">
                            <div>
                                <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-red-500" />
                                    Sin Comprar
                                </h2>
                            </div>
                            <button
                                onClick={handleBroadcast}
                                disabled={selectedInactive.length === 0}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Megaphone className="w-4 h-4" />
                                Crear Difusión
                                {selectedInactive.length > 0 && <span className="bg-white/20 px-1.5 rounded text-xs">{selectedInactive.length}</span>}
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <button
                                                onClick={toggleAllInactive}
                                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                            >
                                                {selectedInactive.length === stats.inactiveCustomers.length && stats.inactiveCustomers.length > 0 ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Cliente</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {(stats.inactiveCustomers || []).map((user) => {
                                        const isSelected = selectedInactive.includes(user.id);
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50'}`}
                                                onClick={() => toggleInactiveSelection(user.id)}
                                            >
                                                <td className="px-4 py-3">
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-zinc-300" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs">
                                                    {user.phone}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {(!stats.inactiveCustomers || stats.inactiveCustomers.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckSquare className="w-8 h-8 opacity-20" />
                                        <span>¡Todos han comprado!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stagnant Products Block */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[300px]">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-orange-50/30 dark:bg-orange-900/10">
                        <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <PackageX className="w-5 h-5 text-orange-500" />
                            Productos Estancados
                        </h2>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-zinc-500">Producto</th>
                                    <th className="px-4 py-3 font-medium text-zinc-500 text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {(stats.stagnantProducts || []).map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                                            {product.name}
                                            <div className="text-xs text-zinc-400">{product.categoryName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-500">
                                            ${product.price.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!stats.stagnantProducts || stats.stagnantProducts.length === 0) && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                                ¡Todo se está vendiendo!
                            </div>
                        )}
                    </div>
                </div>

                {/* Duplicate Orders Block */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[300px]">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/30 dark:bg-amber-900/10">
                        <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <Copy className="w-5 h-5 text-amber-500" />
                            Posibles Duplicados
                        </h2>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-800/10 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-zinc-500">Cliente</th>
                                    <th className="px-4 py-3 font-medium text-zinc-500 text-center">Hora</th>
                                    <th className="px-4 py-3 font-medium text-zinc-500 text-right">Valor</th>
                                    <th className="px-4 py-3 font-medium text-zinc-500 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {(stats.duplicateOrders || []).map((order, i) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                                            {order.customerName}
                                        </td>
                                        <td className="px-4 py-3 text-center text-zinc-500">
                                            {order.time}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-200">
                                            ${order.value.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDeleteDuplicate(order.id)}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded transition-colors"
                                                title="Borrar duplciado"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!stats.duplicateOrders || stats.duplicateOrders.length === 0) && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm flex-col gap-2">
                                <CheckSquare className="w-8 h-8 opacity-20" />
                                <span>Todo limpio, no hay duplicados</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
