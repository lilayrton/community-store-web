"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { createUser } from "@/actions/create-user";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewCustomerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await createUser(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Cliente creado correctamente.' });
            // Reset form
            (e.target as HTMLFormElement).reset();
            // Redirect after a moment
            setTimeout(() => {
                router.push("/admin/customers");
            }, 1500);
        } else {
            setMessage({ type: 'error', text: result.error || 'Error desconocido' });
        }

        setIsLoading(false);
    };

    return (
        <div className="p-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver a Clientes
            </button>

            <PageHeader
                title="Nuevo Cliente"
                actionLabel=""
            />

            <div className="max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Nombre Completo
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Juan Pérez"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Teléfono
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="+54 11 ..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Email (Usuario)
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Contraseña Inicial
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Requerido (mínimo 6 caracteres)"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Dirección
                        </label>
                        <input
                            name="address"
                            type="text"
                            className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Calle 123, Ciudad"
                        />
                    </div>

                    <hr className="border-zinc-100 dark:border-zinc-800" />

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Crear Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
