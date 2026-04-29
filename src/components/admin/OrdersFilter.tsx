"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Store, Clock, Calendar, History, Layers } from "lucide-react";

export default function OrdersFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCycle = searchParams.get("cycle") || "current";
    const currentStore = searchParams.get("store") || "all";

    // Updates a specific filter while keeping the other
    const updateFilter = (key: 'cycle' | 'store', value: string) => {
        const params = new URLSearchParams(searchParams);

        if (value === 'all') {
            params.delete(key);
            // Special case: if we switch to cycle='all', we might want to keep store or not?
            // Usually valid to see "All history for Alsina".
            // So we just delete the specific key if 'all' is passed for that key.
            // BUT: For store, if we want "Todas", we delete 'store'.
            // For cycle, if we want "Historial", we delete 'cycle'? 
            // In page.tsx: cycle defaults to 'current'. So if we delete it, it goes to 'current'.
            // WE NEED EXPLICIT VALUE FOR 'all' IN CYCLE if default is current.
            if (key === 'cycle') {
                params.set('cycle', 'all');
            }
        } else {
            params.set(key, value);
        }

        router.push(`/admin/orders?${params.toString()}`);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">

                {/* Cycle Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Ciclo Comunitario
                    </label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                        <FilterOption
                            label="Actual"
                            active={currentCycle === 'current'}
                            onClick={() => updateFilter('cycle', 'current')}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                        <FilterOption
                            label="Pasada"
                            active={currentCycle === 'past'}
                            onClick={() => updateFilter('cycle', 'past')}
                            icon={<History className="w-4 h-4" />}
                        />
                        <FilterOption
                            label="Historial"
                            active={currentCycle === 'all'}
                            onClick={() => updateFilter('cycle', 'all')}
                            icon={<Layers className="w-4 h-4" />}
                        />
                    </div>
                </div>

                <div className="w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block self-stretch"></div>

                {/* Store Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        Sucursal
                    </label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                        <FilterOption
                            label="Todas"
                            active={!searchParams.get("store") || searchParams.get("store") === 'all'}
                            onClick={() => updateFilter('store', 'all')}
                        />
                        <FilterOption
                            label="Alsina"
                            active={currentStore === 'alsina'}
                            onClick={() => updateFilter('store', 'alsina')}
                        />
                        <FilterOption
                            label="Malabia"
                            active={currentStore === 'malabia'}
                            onClick={() => updateFilter('store', 'malabia')}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function FilterOption({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${active
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
