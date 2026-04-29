import PageHeader from "@/components/admin/PageHeader";
import { MapPin, Edit2, Phone, Clock } from "lucide-react";

export default function LocationsPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <PageHeader
                title="Ubicaciones"
                actionLabel="+ Nueva Ubicación"
                actionHref="/admin/locations/new"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Card Malabia */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Sucursal Malabia</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 mt-1">
                                    Activa
                                </span>
                            </div>
                        </div>
                        <button className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <Edit2 size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-4 flex-1 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <MapPin size={16} className="mt-0.5 text-zinc-400" />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Malabia (Dirección exacta por definir)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <Clock size={16} className="mt-0.5 text-zinc-400" />
                            <span>Horarios de atención por definir</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <Phone size={16} className="mt-0.5 text-zinc-400" />
                            <span>Teléfono por definir</span>
                        </div>
                    </div>
                </div>

                {/* Card Alsina */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Sucursal Alsina</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 mt-1">
                                    Activa
                                </span>
                            </div>
                        </div>
                        <button className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <Edit2 size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-4 flex-1 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <MapPin size={16} className="mt-0.5 text-zinc-400" />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Alsina (Dirección exacta por definir)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <Clock size={16} className="mt-0.5 text-zinc-400" />
                            <span>Horarios de atención por definir</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <Phone size={16} className="mt-0.5 text-zinc-400" />
                            <span>Teléfono por definir</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
