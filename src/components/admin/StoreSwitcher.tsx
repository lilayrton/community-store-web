"use client";

import { useState, useTransition } from "react";
import { updateOrderStore } from "@/actions/update-order-store";
import { Loader2, Store } from "lucide-react";

interface StoreSwitcherProps {
    orderId: string;
    currentStore: string;
}

export default function StoreSwitcher({ orderId, currentStore }: StoreSwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSwitch = (newStore: string) => {
        if (newStore === currentStore) return;

        setError(null);
        startTransition(async () => {
            const result = await updateOrderStore(orderId, newStore);
            if (!result.success) {
                setError(result.error || "Error al actualizar");
            }
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sucursal Asignada</span>
            </div>

            <div className="relative inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-full max-w-[200px]">
                {/* Loader overlay */}
                {isPending && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-lg flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    </div>
                )}
                
                <button
                    onClick={() => handleSwitch('alsina')}
                    disabled={isPending}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                        currentStore === 'alsina'
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                    Alsina
                </button>
                <button
                    onClick={() => handleSwitch('malabia')}
                    disabled={isPending}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                        currentStore === 'malabia'
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                    Malabia
                </button>
            </div>
            
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
