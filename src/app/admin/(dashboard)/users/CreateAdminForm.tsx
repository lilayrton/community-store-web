"use client";

import { useState } from "react";
import { UserPlus, Loader2, X } from "lucide-react";
import { createAdminUser } from "@/actions/create-admin";
import { useRouter } from "next/navigation";

export default function CreateAdminForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        const result = await createAdminUser(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Administrador creado correctamente' });
            router.refresh();
            setTimeout(() => {
                setIsOpen(false);
                setMessage(null);
            }, 1000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al crear usuario' });
        }
        setIsLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-blue-600/20"
            >
                <UserPlus className="w-4 h-4" />
                Nuevo Administrador
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Nuevo Administrador</h2>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Nombre Completo
                        </label>
                        <input
                            name="name"
                            required
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Usuario
                            </label>
                            <input
                                name="username"
                                required
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="juanadmin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Email (Opcional)
                            </label>
                            <input
                                name="email"
                                type="email"
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="juan@empresa.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Contraseña
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Administrador"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
