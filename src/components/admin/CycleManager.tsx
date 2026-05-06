"use client";

import { useState, useTransition } from "react";
import { openCycle, closeCycle } from "@/actions/admin/cycle-actions";
import { Calendar, Play, Square, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CycleManagerProps {
    activeCycle: any;
}

export default function CycleManager({ activeCycle }: CycleManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newCycleName, setNewCycleName] = useState("");
    const router = useRouter();

    const handleOpen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCycleName.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await openCycle(newCycleName.trim());
            if (result.success) {
                setIsCreating(false);
                setNewCycleName("");
                router.refresh();
            } else {
                setError(result.error || "Error al abrir");
            }
        });
    };

    const handleClose = async () => {
        if (!activeCycle) return;
        if (!confirm(`¿Estás seguro de cerrar la comunitaria "${activeCycle.name}"? Los clientes ya no podrán hacer pedidos.`)) return;

        setError(null);
        startTransition(async () => {
            const result = await closeCycle(activeCycle.id);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Error al cerrar");
            }
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold text-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
                <h2>Estado de la Comunitaria</h2>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm border border-red-100 dark:border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {activeCycle ? (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium text-green-700 dark:text-green-400">Abierta: {activeCycle.name}</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Iniciada el {new Date(activeCycle.startDate).toLocaleDateString('es-AR')} a las {new Date(activeCycle.startDate).toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="font-medium text-red-700 dark:text-red-400">Cerrada</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No hay ninguna comunitaria activa. Los clientes no pueden realizar pedidos.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {activeCycle ? (
                        <button
                            onClick={handleClose}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" fill="currentColor" />}
                            Cerrar Comunitaria
                        </button>
                    ) : (
                        isCreating ? (
                            <form onSubmit={handleOpen} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newCycleName}
                                    onChange={(e) => setNewCycleName(e.target.value)}
                                    placeholder="Ej: Comunitaria Mayo"
                                    className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    disabled={isPending}
                                />
                                <button
                                    type="submit"
                                    disabled={isPending || !newCycleName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Abrir
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    disabled={isPending}
                                    className="px-3 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
                            >
                                <Play className="w-4 h-4" fill="currentColor" />
                                Nueva Comunitaria
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
