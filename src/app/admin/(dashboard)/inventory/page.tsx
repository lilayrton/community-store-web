'use client';

import { useState, useMemo, useEffect } from 'react';
import { getInventoryProducts, searchInventoryProducts, searchUntrackedProducts, getQuinteroProducts, getUntrackedProducts, batchUpdateInventory, getStockHistory, createInventoryProducts, CatalogProduct, InventoryChange } from '@/actions/admin/catalog-actions';
import { Search, Loader2, Save, PackageOpen, AlertCircle, TrendingUp, TrendingDown, RefreshCcw, History as HistoryIcon, User, Plus, X, ChevronDown } from 'lucide-react';
import StockHistoryList from '@/components/admin/StockHistoryList';

export default function InventoryPage() {
    // Split State: Quintero (Tracked) vs Catalog Search (Untracked)
    const [quinteroProducts, setQuinteroProducts] = useState<CatalogProduct[]>([]);
    const [catalogResults, setCatalogResults] = useState<CatalogProduct[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    // Batch Edit State
    const [pendingChanges, setPendingChanges] = useState<Record<string, InventoryChange>>({});

    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // Manual Creation State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualProduct, setManualProduct] = useState({
        name: "",
        category: "General",
        price: "",
        packageType: "Unidad",
        packageQuantity: 1,
        variants: [] as string[],
        newVariant: "",
        initialStock: 0
    });

    // Debounced Search Effect (Only affects Catalog Results)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.length >= 2) {
                setIsUpdating("search");
                const results = await searchUntrackedProducts(search);
                setCatalogResults(results);
                setIsUpdating(null);
            } else {
                // If search is empty, reload default list (untracked)
                const data = await getUntrackedProducts(500);
                setCatalogResults(data);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Load initial data (Quintero Products only)
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [data, untrackedData, historyLog] = await Promise.all([
            getQuinteroProducts(),
            getUntrackedProducts(500),
            getStockHistory(20)
        ]);
        setQuinteroProducts(data); // Expecting only tracked items
        setCatalogResults(untrackedData); // Initial untracked list
        setHistory(historyLog);
        setIsLoading(false);
    };

    // --- Batch Handlers ---

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    const handleStockChange = (id: string, newStock: number) => {
        // Only Quintero products have stock to change
        const product = quinteroProducts.find(p => p.id === id);
        if (!product) return;

        // Update local UI immediately for responsiveness
        setQuinteroProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

        // Track change
        setPendingChanges(prev => ({
            ...prev,
            [id]: {
                id,
                name: product.name,
                oldStock: (prev[id]?.oldStock ?? product.stock),
                stock: newStock,
                isStockTracked: prev[id]?.isStockTracked
            }
        }));
    };

    const handleToggleTracking = (id: string, isTracked: boolean) => {
        // Logic: Move between lists
        if (isTracked) {
            // Moving from Catalog -> Quintero
            const product = catalogResults.find(p => p.id === id);
            if (!product) return;

            setCatalogResults(prev => prev.filter(p => p.id !== id));
            setQuinteroProducts(prev => [...prev, { ...product, isStockTracked: true }]); // Append to Quintero

            setPendingChanges(prev => ({
                ...prev,
                [id]: {
                    id,
                    name: product.name,
                    oldStock: (prev[id]?.oldStock ?? product.stock),
                    isStockTracked: true,
                    stock: prev[id]?.stock
                }
            }));
        } else {
            // Moving from Quintero -> Catalog (or just removing from view if not searching)
            const product = quinteroProducts.find(p => p.id === id);
            if (!product) return;

            setQuinteroProducts(prev => prev.filter(p => p.id !== id));
            // Only add to catalog results if it matches current search?
            // For simplicity, we can add it to catalogResults so it doesn't vanish into thin air if they want to undo.
            // If the user clears search, it disappears. If search matches, it should appear?
            setCatalogResults(prev => [...prev, { ...product, isStockTracked: false }]);

            setPendingChanges(prev => ({
                ...prev,
                [id]: {
                    id,
                    name: product.name,
                    oldStock: (prev[id]?.oldStock ?? product.stock),
                    isStockTracked: false,
                    stock: prev[id]?.stock
                }
            }));
        }
    };

    const handleSaveChanges = async () => {
        setIsUpdating("saving");
        const changes = Object.values(pendingChanges);

        const result = await batchUpdateInventory(changes);

        if (result.success) {
            setPendingChanges({});
            // Reload history to show what just happened
            const newHistory = await getStockHistory(20);
            setHistory(newHistory);
        } else {
            alert("Error salvando cambios. Por favor recarga la página.");
        }
        setIsUpdating(null);
    };

    // --- Manual Creation Handlers ---
    const handleAddVariant = () => {
        if (manualProduct.newVariant.trim()) {
            setManualProduct(prev => ({
                ...prev,
                variants: [...prev.variants, prev.newVariant.trim()],
                newVariant: ""
            }));
        }
    };

    const handleRemoveVariant = (index: number) => {
        setManualProduct(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleCreateManual = async () => {
        setIsUpdating("creating");
        const productsToCreate: Partial<CatalogProduct>[] = [];

        if (manualProduct.variants.length > 0) {
            manualProduct.variants.forEach(variant => {
                productsToCreate.push({
                    name: `${manualProduct.name} ${variant}`,
                    price: parseFloat(manualProduct.price) || 0,
                    category: manualProduct.category,
                    stock: manualProduct.initialStock,
                    packageType: manualProduct.packageType || "Unidad",
                    packageQuantity: Number(manualProduct.packageQuantity) || 1,
                    isStockTracked: true
                });
            });
        } else {
            productsToCreate.push({
                name: manualProduct.name,
                price: parseFloat(manualProduct.price) || 0,
                category: manualProduct.category,
                stock: manualProduct.initialStock,
                packageType: manualProduct.packageType || "Unidad",
                packageQuantity: Number(manualProduct.packageQuantity) || 1,
                isStockTracked: true
            });
        }

        const result = await createInventoryProducts(productsToCreate);

        if (result.success && result.createdProducts) {
            setIsManualModalOpen(false);
            setManualProduct({
                name: "",
                category: "General",
                price: "",
                packageType: "Unidad",
                packageQuantity: 1,
                variants: [],
                newVariant: "",
                initialStock: 0
            });

            // Optimistic update
            setQuinteroProducts(prev => [...result.createdProducts!, ...prev]);

            // Update history
            if (result.newLogs) {
                setHistory(prev => [...result.newLogs!, ...prev]);
            }

            // Optional: Show a non-intrusive toast? For now, just closing is fast and responsive.
        } else {
            alert("Error al crear productos.");
        }
        setIsUpdating(null);
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-3">
                        <PackageOpen className="h-8 w-8 text-blue-600" />
                        Gestión Quintero
                    </h1>
                    <p className="text-zinc-500 mt-2">
                        Gestiona el stock de los productos limitados.
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-purple-600/20 transition-all text-sm"
                    >
                        <Plus size={18} />
                        Nuevo Producto
                    </button>

                    {/* Save Button (Header) */}
                    {hasPendingChanges && (
                        <button
                            onClick={handleSaveChanges}
                            disabled={isUpdating === "saving"}
                            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-600/20 transition-all animate-bounce-short"
                        >
                            {isUpdating === "saving" ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Guardar ({Object.keys(pendingChanges).length})
                        </button>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-4 z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar en Catálogo General..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                    />
                    {isUpdating === "search" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-blue-600" size={16} />
                        </div>
                    )}
                </div>
                <button
                    onClick={loadData}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    title="Recargar datos"
                >
                    <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Tracked Products (Quintero) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10 flex justify-between items-center">
                                <h2 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    En Quintero (Stock Controlado)
                                </h2>
                                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                    {quinteroProducts.length} items
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {quinteroProducts.length === 0 && (
                                    <div className="text-center py-12 text-zinc-400 text-sm">
                                        No hay productos con control de stock.
                                        <br />Agrega uno desde el catálogo o crea uno nuevo.
                                    </div>
                                )}
                                {quinteroProducts.map(product => {
                                    const isChanged = !!pendingChanges[product.id];
                                    return (
                                        <div key={product.id} className={`p-3 rounded-lg border ${product.stock <= 0 ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900' : isChanged ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} flex items-center justify-between group transition-all`}>
                                            <div className="flex-1">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</div>
                                                <div className="text-xs text-zinc-500 flex gap-2 mt-0.5">
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">{product.category}</span>
                                                    {product.stock <= 0 && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> AGOTADO</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
                                                    <button
                                                        onClick={() => handleStockChange(product.id, Math.max(0, product.stock - 1))}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400 font-bold"
                                                        disabled={isUpdating === "saving"}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={product.stock}
                                                        onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                                                        className={`w-12 text-center bg-transparent outline-none font-mono ${isChanged ? 'text-blue-600 font-bold' : 'text-zinc-900 dark:text-zinc-100'}`}
                                                    />
                                                    <button
                                                        onClick={() => handleStockChange(product.id, product.stock + 1)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-blue-600 dark:text-blue-400 font-bold"
                                                        disabled={isUpdating === "saving"}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleToggleTracking(product.id, false)}
                                                    className="text-zinc-400 hover:text-red-500 p-2 transition-colors tooltip"
                                                    title="Quitar de Quintero (Stock Infinito)"
                                                    disabled={isUpdating === "saving"}
                                                >
                                                    <TrendingDown size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Untracked Products (Catalog Results) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[600px] opacity-80 hover:opacity-100 transition-opacity">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-zinc-500">
                                <h2 className="font-bold flex items-center gap-2">
                                    <PackageOpen size={18} />
                                    Resultados del Catálogo
                                </h2>
                                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                                    {catalogResults.length} items
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {catalogResults.length === 0 && (
                                    <div className="text-center py-12 text-zinc-400 text-sm">
                                        No hay productos disponibles en el catálogo general.
                                        <br />Añade productos nuevos desde el botón "Crear Nuevo".
                                    </div>
                                )}
                                {catalogResults.map(product => {
                                    const isChanged = !!pendingChanges[product.id];
                                    return (
                                        <div key={product.id} className={`p-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center justify-between group transition-all ${isChanged ? 'bg-blue-50/50' : ''}`}>
                                            <div className="flex-1">
                                                <div className="font-medium text-zinc-700 dark:text-zinc-300">{product.name}</div>
                                                <div className="text-xs text-zinc-400 flex gap-2">
                                                    <span>{product.category}</span>
                                                    {product.stock === 0 && <span className="text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1 rounded">Stock: 0</span>}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleToggleTracking(product.id, true)}
                                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg text-xs font-medium transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                disabled={isUpdating === "saving"}
                                            >
                                                + Agregar a Quintero
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Stock History */}
                    <StockHistoryList logs={history} />
                </div>
            )}

            {/* Floating Save Button (Mobile) */}
            {hasPendingChanges && (
                <div className="fixed bottom-6 right-6 md:hidden z-50">
                    <button
                        onClick={handleSaveChanges}
                        disabled={isUpdating === "saving"}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full font-bold shadow-xl shadow-blue-600/30 transition-all animate-bounce-short"
                    >
                        {isUpdating === "saving" ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        Guardar
                    </button>
                </div>
            )}

            {/* Manual Create Modal (Reused Design) */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Crear Producto en Quintero</h3>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Nombre del producto</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Yerba Mate 1kg"
                                    value={manualProduct.name}
                                    onChange={(e) => setManualProduct({ ...manualProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Categoría</label>
                                    <select
                                        value={manualProduct.category}
                                        onChange={(e) => setManualProduct({ ...manualProduct, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="General">General</option>
                                        <option value="Almacen">Almacén</option>
                                        <option value="Bebidas">Bebidas</option>
                                        <option value="Frescos">Frescos</option>
                                        <option value="Limpieza">Limpieza</option>
                                        <option value="Kiosco">Kiosco</option>
                                    </select>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Precio</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={manualProduct.price}
                                        onChange={(e) => setManualProduct({ ...manualProduct, price: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de Empaque</label>
                                    <div className="relative">
                                        <select
                                            value={manualProduct.packageType}
                                            onChange={(e) => setManualProduct({ ...manualProduct, packageType: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Unidad">Unidad</option>
                                            <option value="Fraccion">Fracción</option>
                                            <option value="Display">Display</option>
                                            <option value="Bolsa">Bolsa</option>
                                            <option value="Caja">Caja</option>
                                            <option value="Carton">Cartón</option>
                                            <option value="Tira">Tira</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Cant.</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={manualProduct.packageQuantity}
                                        onChange={(e) => setManualProduct({ ...manualProduct, packageQuantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Stock Inicial</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={manualProduct.initialStock}
                                    onChange={(e) => setManualProduct({ ...manualProduct, initialStock: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Variantes (opcional)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Ej: 1 1/4"
                                        value={manualProduct.newVariant}
                                        onChange={(e) => setManualProduct({ ...manualProduct, newVariant: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddVariant()}
                                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    />
                                    <button
                                        onClick={handleAddVariant}
                                        className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                {manualProduct.variants.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {manualProduct.variants.map((v, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md border border-purple-100 dark:border-purple-800">
                                                {v}
                                                <button onClick={() => handleRemoveVariant(i)} className="hover:text-purple-900 dark:hover:text-purple-100">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex justify-end gap-2">
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateManual}
                                disabled={!manualProduct.name}
                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {manualProduct.variants.length > 0 ? `Crear ${manualProduct.variants.length} Productos` : 'Crear Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
