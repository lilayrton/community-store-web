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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/update-profile";
import { OrdersList } from "@/components/orders-list";

interface ProfileFormProps {
    customer: {
        id: string;
        name: string | null;
        email: string | null;
        address: string | null;
        phone: string | null;
        role: string;
    };
    orders: any[];
}

export default function ProfileForm({ customer, orders }: ProfileFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

    const [firstName, lastName] = (customer.name || "").split(" ", 2);

    const [formData, setFormData] = useState({
        firstName: firstName || "",
        lastName: lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        password: "",
        confirmPassword: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const result = await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
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

    return (
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
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-600" />
                        Mi Perfil
                    </h1>
                    <p className="text-zinc-600 font-medium text-lg mt-1">Gestioná tu información personal</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-zinc-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-4 text-lg font-bold border-b-4 transition-colors ${activeTab === 'profile'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                        }`}
                >
                    Información Personal
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-4 text-lg font-bold border-b-4 transition-colors ${activeTab === 'orders'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                        }`}
                >
                    Mis Pedidos
                </button>
            </div>

            {activeTab === 'profile' ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                    {message && (
                        <div className={`mx-8 mt-8 p-4 rounded-xl text-base font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="p-6 md:p-8 space-y-10">
                        {/* Personal Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900 border-b border-zinc-100 pb-4">
                                Datos Personales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Apellido</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+54 ..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Security Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 border-b border-zinc-100 pb-4">
                                    Ubicación
                                </h2>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Dirección de Entrega</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Av. Corrientes 1234"
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 border-b border-zinc-100 pb-4">
                                    Seguridad
                                </h2>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800">Cambiar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Ingresa nueva contraseña"
                                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-medium text-lg transition-all"
                                        />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">Deja esto en blanco si no quieres cambiarla.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 md:px-8 py-6 bg-zinc-50 border-t border-zinc-200 flex flex-col-reverse sm:flex-row justify-end gap-4">
                        <Link
                            href="/"
                            className="px-6 py-3 text-zinc-600 font-bold text-lg hover:bg-zinc-200 rounded-xl transition-colors text-center"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            ) : (
                <OrdersList orders={orders} />
            )}
        </div>
    );
}
