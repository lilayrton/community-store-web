'use client';

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Search, Loader2, Package } from "lucide-react";
import { getAllSystemProducts, toggleProductActiveStatus, CatalogProduct } from "@/actions/admin/catalog-actions";
import Link from "next/link";
import EditProductModal from "@/components/admin/EditProductModal";

export default function ProductsPage() {
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toggling, setToggling] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const limit = 100;

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts(search, currentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, currentPage]);

    const loadProducts = async (q: string, page: number) => {
        setLoading(true);
        try {
            const data = await getAllSystemProducts(q, page, limit);
            setProducts(data.products);
            setTotalProducts(data.total);
            setActiveCount(data.activeCount);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setToggling(id);
        
        // Optimistic update
        setProducts(prev => prev.map(p => 
            p.id === id ? { ...p, isActive: !currentStatus } : p
        ));

        try {
            const result = await toggleProductActiveStatus(id, !currentStatus);
            if (!result.success) {
                // Revert if failed
                setProducts(prev => prev.map(p => 
                    p.id === id ? { ...p, isActive: currentStatus } : p
                ));
                alert("Error al actualizar el estado");
            }
        } catch (error) {
            // Revert if failed
            setProducts(prev => prev.map(p => 
                p.id === id ? { ...p, isActive: currentStatus } : p
            ));
        } finally {
            setToggling(null);
        }
    };

    // Removed filteredProducts as filtering is now handled by the server

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <PageHeader
                title="Catálogo de Productos"
            />

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col mt-6">
                
                {/* Toolbar */}
                <div className="sticky top-0 z-10 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-2xl">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o proveedor..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm shadow-sm"
                        />
                    </div>
                    <div className="text-sm font-medium text-zinc-500 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        {activeCount} Activos / {totalProducts} Total
                    </div>
                </div>

                {/* Table (Desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Cargando catálogo completo...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                            <Package size={48} className="mb-4 opacity-50 text-zinc-300" />
                            <p className="font-medium text-zinc-500">No se encontraron productos.</p>
                            {search && <button onClick={() => {setSearch(''); setCurrentPage(1);}} className="mt-2 text-blue-500 hover:underline">Limpiar búsqueda</button>}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Producto</th>
                                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Proveedor</th>
                                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 text-right">Precio Venta</th>
                                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 text-center">Estado en Tienda</th>
                                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {products.map(product => (
                                    <tr key={product.id} className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${!product.isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/50 grayscale-[40%] opacity-80' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{product.name}</div>
                                            <div className="text-xs text-zinc-500 flex gap-2 mt-0.5">
                                                <span className="font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 rounded text-[10px]">ID: {product.id.substring(0, 8)}</span>
                                                <span>{product.packageType} x{product.packageQuantity}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50">
                                                {product.provider || 'Sin Asignar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-blue-600 dark:text-blue-400 text-base">
                                                ${product.price.toLocaleString('es-AR', {minimumFractionDigits: product.price % 1 === 0 ? 0 : 2, maximumFractionDigits: 2})}
                                            </div>
                                            <div className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wide">
                                                {product.unitPrice ? `$${product.unitPrice.toLocaleString('es-AR', {maximumFractionDigits: 2})} c/u` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {/* iOS Style Toggle Switch */}
                                            <button 
                                                onClick={() => handleToggleStatus(product.id, product.isActive)}
                                                disabled={toggling === product.id}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 ${product.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${product.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <div className="text-[10px] font-black mt-1 uppercase tracking-wider">
                                                {product.isActive ? <span className="text-emerald-600 dark:text-emerald-400">Activo</span> : <span className="text-zinc-400">Inactivo</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setEditingProduct(product)}
                                                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-800"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards (Mobile) */}
                <div className="md:hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Cargando catálogo completo...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                            <Package size={48} className="mb-4 opacity-50 text-zinc-300" />
                            <p className="font-medium text-zinc-500">No se encontraron productos.</p>
                            {search && <button onClick={() => {setSearch(''); setCurrentPage(1);}} className="mt-2 text-blue-500 hover:underline">Limpiar búsqueda</button>}
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={`mobile-${product.id}`} className={`p-4 transition-colors ${!product.isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/50 grayscale-[40%] opacity-80' : ''}`}>
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div className="flex-1">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{product.name}</div>
                                        <div className="text-xs text-zinc-500 flex flex-wrap gap-2 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50">
                                                {product.provider || 'Sin Asignar'}
                                            </span>
                                            <span>{product.packageType} x{product.packageQuantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-black text-blue-600 dark:text-blue-400 text-lg">
                                            ${product.price.toLocaleString('es-AR', {minimumFractionDigits: product.price % 1 === 0 ? 0 : 2, maximumFractionDigits: 2})}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">
                                            {product.unitPrice ? `$${product.unitPrice.toLocaleString('es-AR', {maximumFractionDigits: 2})} c/u` : '-'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleToggleStatus(product.id, product.isActive)}
                                            disabled={toggling === product.id}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 ${product.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${product.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <div className="text-[11px] font-black uppercase tracking-wider">
                                            {product.isActive ? <span className="text-emerald-600 dark:text-emerald-400">Activo</span> : <span className="text-zinc-400">Inactivo</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setEditingProduct(product)}
                                        className="text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Pagination Controls */}
                {totalProducts > limit && (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex justify-between items-center text-sm">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
                        >
                            Anterior
                        </button>
                        <span className="text-zinc-500 font-medium">
                            Página {currentPage} de {Math.ceil(totalProducts / limit)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalProducts / limit), prev + 1))}
                            disabled={currentPage >= Math.ceil(totalProducts / limit) || loading}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={(updated) => {
                        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
}
