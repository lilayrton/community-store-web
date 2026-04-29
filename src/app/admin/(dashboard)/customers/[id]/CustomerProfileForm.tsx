"use client";

import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Save,
    ArrowLeft,
    Shield,
    ShoppingBag,
    Calendar,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCustomerAdmin } from "@/actions/update-customer-admin";
import { toggleCustomerStatus } from "@/actions/toggle-customer-status";

interface CustomerProfileFormProps {
    customer: {
        id: string;
        name: string | null;
        email: string | null;
        username: string | null;
        address: string | null;
        phone: string | null;
        role: string;
        isActive: boolean;
        assignedStore: string;
    };
    orders: any[];
}

export default function CustomerProfileForm({ customer, orders }: CustomerProfileFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

    // Split name for UI (first/last) if stored as full name
    const [firstName, lastName] = (customer.name || "").split(" ", 2);

    const [formData, setFormData] = useState({
        firstName: firstName || "",
        lastName: lastName || "", // rudimentary split, but works for basic UI
        email: customer.email || "",
        // username removed from local state needed for form
        phone: customer.phone || "",
        address: customer.address || "",
        password: "",
        confirmPassword: "",
        assignedStore: customer.assignedStore || "alsina",
        isEnabled: customer.isActive ?? true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleStatus = async () => {
        const newStatus = !formData.isEnabled;

        // Optimistic update
        setFormData(prev => ({
            ...prev,
            isEnabled: newStatus
        }));

        try {
            const result = await toggleCustomerStatus(customer.id, newStatus);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                router.refresh();
            } else {
                // Revert on failure
                setFormData(prev => ({
                    ...prev,
                    isEnabled: !newStatus
                }));
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            // Revert on failure
            setFormData(prev => ({
                ...prev,
                isEnabled: !newStatus
            }));
            setMessage({ type: 'error', text: "Error al cambiar el estado" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const result = await updateCustomerAdmin(customer.id, {
                name: `${formData.firstName} ${formData.lastName}`.trim(), // Combine names back
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                assignedStore: formData.assignedStore,
                isActive: formData.isEnabled
            });

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                // Clear password fields on success
                setFormData(prev => ({
                    ...prev,
                    password: "",
                    confirmPassword: ""
                }));
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Ocurrió un error inesperado" });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-500" />
                        Perfil del Cliente
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">#{customer.id}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                >
                    Información Personal
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                >
                    Pedidos
                </button>
            </div>

            {activeTab === 'profile' ? (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {/* Status Bar */}
                    <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 flex justify-between items-center">
                        <div>
                            <span className="text-sm font-medium text-zinc-500 block mb-1">Estado de Cuenta</span>
                            <div
                                onClick={toggleStatus}
                                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.isEnabled
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${formData.isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                {formData.isEnabled ? 'Habilitado' : 'Deshabilitado'}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`mx-8 mt-6 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="p-8 space-y-8">
                        {/* Personal Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                Información Personal
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* REMOVED USERNAME FIELD AS REQUESTED */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Apellido</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+54 ..."
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Security Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    Ubicación
                                </h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Av. Calle 123"
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    Sucursal Asignada
                                </h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sucursal Preferida</label>
                                    <div className="relative">
                                        <ShoppingBag className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                        <select
                                            name="assignedStore"
                                            value={formData.assignedStore}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                                        >
                                            <option value="alsina">Sucursal Alsina</option>
                                            <option value="malabia">Sucursal Malabia</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-zinc-500">Determina la sucursal "home" del cliente.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    Seguridad
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nueva Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/10 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h2 className="font-semibold text-lg text-zinc-900 dark:text-white">Pedidos Recientes</h2>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">{orders.length} pedidos</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                            <p>Este cliente aún no ha realizado pedidos.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">ID Pedido</th>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                                                ${Number(order.total).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium text-xs"
                                                >
                                                    Ver Detalle <ChevronRight className="w-3 h-3 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
