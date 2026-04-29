"use client";

import { useState, useEffect } from "react";
import { getProductsForOrder, addOrderItemToOrder } from "@/actions/admin/order-actions";
import { X, Search, Loader2, Plus } from "lucide-react";

export default function AddProductToOrderModal({ orderId, onClose, onWarning }: { orderId: string, onClose: () => void, onWarning: (msg: string) => void }) {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingSearch(true);
            const res = await getProductsForOrder(query);
            if (res.success) {
                setProducts(res.products || []);
            }
            setLoadingSearch(false);
        };

        const debounce = setTimeout(fetchProducts, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleAdd = async (productId: string) => {
        setAddingId(productId);
        const res = await addOrderItemToOrder(orderId, productId, 1);
        
        if (!res.success) {
            alert(res.error);
        } else {
            if (res.warning) onWarning(res.warning);
            onClose(); // Close modal on success
        }
        setAddingId(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Agregar Producto al Pedido</h2>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar productos por nombre..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-blue-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loadingSearch ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            No se encontraron productos.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map(p => (
                                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-300 transition-colors gap-4">
                                    <div>
                                        <p className="font-semibold text-zinc-900 dark:text-white">{p.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className="font-medium text-blue-600 dark:text-blue-400">${Number(p.price).toFixed(2)}</span>
                                            {p.isStockTracked ? (
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    Stock: {p.stock}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs">Sin control de stock</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(p.id)}
                                        disabled={addingId === p.id}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {addingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Agregar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
