"use client";

import { useState, useEffect } from "react";
import { History, CalendarDays, FilePlus, ChevronRight, Loader2, PackageOpen, Save } from "lucide-react";
import { getProductsFromCycle, publishCatalog, getRecentCycles, getQuinteroProducts, getComu4Products, clearCatalogDraft, getActiveCatalogProducts, CatalogProduct } from "@/actions/admin/catalog-actions";
import CatalogEditor from "@/components/admin/CatalogEditor";

type Step = "source" | "editor" | "summary";
type SourceType = number | "blank" | "quintero" | "comu4" | "active";

export default function ProductSetupPage() {
    const [step, setStep] = useState<Step>("source");
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [recentCycles, setRecentCycles] = useState<any[]>([]);
    const [loadingCycles, setLoadingCycles] = useState(true);

    useEffect(() => {
        getRecentCycles().then(data => {
            setRecentCycles(data);
            setLoadingCycles(false);
        });
    }, []);

    const handleSourceSelect = async (source: SourceType) => {
        setLoading(true);
        try {
            let fetchedProducts: CatalogProduct[] = [];
            if (source === "blank") {
                fetchedProducts = [];
            } else if (source === "quintero") {
                fetchedProducts = await getQuinteroProducts();
            } else if (source === "comu4") {
                fetchedProducts = await getComu4Products();
            } else if (source === "active") {
                fetchedProducts = await getActiveCatalogProducts();
            } else {
                fetchedProducts = await getProductsFromCycle(source as number);
            }

            setProducts(fetchedProducts);
            setStep("editor");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (finalProducts: CatalogProduct[]) => {
        if (!confirm("¿Seguro que querés guardar este catálogo? Estos serán los productos disponibles cuando abras una comunitaria.")) return;

        setIsPublishing(true);
        try {
            const result = await publishCatalog(finalProducts);
            if (result.success) {
                localStorage.removeItem("catalog-editor-draft");
                clearCatalogDraft();
                alert(`¡Catálogo actualizado con ${result.count} productos activos! Recordá abrir una Comunitaria desde el Dashboard para empezar a vender.`);
                setStep("source");
                // Refresh cycles
                getRecentCycles().then(setRecentCycles);
            } else {
                alert("Hubo un error al guardar. Revisá la consola.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {step === "source" && (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Editor de Catálogo</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Paso 1: Usar una plantilla (catálogo anterior) o empezar de cero.
                    </p>
                </div>
            )}

            {step === "source" && (
                <div className="space-y-8">
                    {/* Historical Cycles */}
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                            <History size={18} />
                            Plantillas Recientes
                        </h2>

                        {loadingCycles ? (
                            <div className="text-sm text-zinc-400 animate-pulse">Cargando historial...</div>
                        ) : recentCycles.length === 0 ? (
                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500 mb-6">
                                <p>No hay catálogos anteriores guardados.</p>
                                <p className="text-sm mt-1">Guardá tu primer catálogo para crear una plantilla.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {recentCycles.map((cycle, index) => (
                                    <button
                                        key={cycle.id}
                                        onClick={() => handleSourceSelect(index + 1)} // 1 = latest
                                        disabled={loading}
                                        className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left hover:border-blue-400 hover:shadow-md transition-all group relative"
                                    >
                                        <div className="text-xs font-bold text-zinc-400 mb-2">
                                            {new Date(cycle.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 truncate">
                                            {cycle.name}
                                        </div>
                                        <div className="text-blue-500 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Usar Plantilla <ChevronRight size={12} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Option: Blank Canvas */}
                        <button
                            onClick={() => handleSourceSelect("blank")}
                            disabled={loading}
                            className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl text-left hover:shadow-md transition-all flex items-center gap-4 group"
                        >
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <FilePlus size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Lienzo en Blanco</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Empezar desde cero</p>
                            </div>
                        </button>

                        {/* Option: Import Quintero */}
                        <button
                            onClick={() => handleSourceSelect("quintero")}
                            disabled={loading}
                            className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left hover:shadow-md transition-all flex items-center gap-4 group"
                        >
                            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                <PackageOpen size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Importar Quintero</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Cargar todos los productos de stock controlado</p>
                            </div>
                        </button>

                        {/* Option: Import Comu 4 */}
                        <button
                            onClick={() => handleSourceSelect("comu4")}
                            disabled={loading}
                            className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl text-left hover:shadow-md transition-all flex items-center gap-4 group"
                        >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FilePlus size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Importar comu -4.csv</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Cargar productos de la lista externa</p>
                            </div>
                        </button>

                        {/* Option: Edit Current Catalog (Gold Aesthetic) */}
                        <button
                            onClick={() => handleSourceSelect("active")}
                            disabled={loading}
                            className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl text-left hover:shadow-md transition-all flex items-center gap-4 group md:col-span-2"
                        >
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                <Save size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 dark:text-amber-50 flex items-center gap-2">
                                    Editar Catálogo Actual
                                    <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800/50 text-[10px] uppercase tracking-wider rounded-full">Activo</span>
                                </h3>
                                <p className="text-amber-700/70 dark:text-amber-400/70 text-sm">Modificar los productos que están subidos actualmente</p>
                            </div>
                        </button>
                    </div>

                    {loading && (
                        <div className="text-center text-zinc-400 animate-pulse py-8">
                            Buscando productos en el historial...
                        </div>
                    )}
                </div>
            )}

            {step === "editor" && (
                <CatalogEditor
                    initialProducts={products}
                    onPublish={handlePublish}
                    onBack={() => setStep("source")}
                />
            )}
        </div>
    );
}
