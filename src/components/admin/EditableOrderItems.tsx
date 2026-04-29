"use client";

import { useState } from "react";
import { updateOrderItemQuantity, removeOrderItem } from "@/actions/admin/order-actions";
import { Plus, Minus, Trash2, Loader2, PlusCircle } from "lucide-react";
import AddProductToOrderModal from "./AddProductToOrderModal";

interface OrderItem {
    id: string;
    quantity: number;
    price: number | string;
    product: {
        id: string;
        name: string;
        isStockTracked: boolean;
        stock: number;
    };
}

export default function EditableOrderItems({ orderId, items, initialTotal }: { orderId: string, items: OrderItem[], initialTotal: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const handleQuantityChange = async (itemId: string, currentQty: number, delta: number) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        setLoadingId(itemId);
        setWarning(null);
        
        const result = await updateOrderItemQuantity(orderId, itemId, newQty);
        if (!result.success) {
            alert(result.error);
        } else if (result.warning) {
            setWarning(result.warning);
        }
        
        setLoadingId(null);
    };

    const handleRemove = async (itemId: string) => {
        if (!confirm("¿Seguro que deseas eliminar este producto del pedido?")) return;
        
        setLoadingId(itemId);
        setWarning(null);
        
        const result = await removeOrderItem(orderId, itemId);
        if (!result.success) {
            alert(result.error);
        }
        
        setLoadingId(null);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Detalle de Factura</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Agregar Producto
                </button>
            </div>

            {warning && (
                <div className="mx-6 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-sm font-medium">
                    {warning}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4 w-40 text-center">Cantidad</th>
                            <th className="px-6 py-4 w-32 text-right">Precio Unit.</th>
                            <th className="px-6 py-4 w-32 text-right">Total</th>
                            <th className="px-6 py-4 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                    {item.product.name}
                                    {item.product.isStockTracked && (
                                        <span className="ml-2 text-xs font-normal text-zinc-400">
                                            (Stock: {item.product.stock})
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <button 
                                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                            disabled={item.quantity <= 1 || loadingId === item.id}
                                            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 disabled:opacity-50"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center font-medium text-zinc-900 dark:text-white">
                                            {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                            disabled={loadingId === item.id}
                                            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    ${Number(item.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                                    ${(item.quantity * Number(item.price)).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleRemove(item.id)}
                                        disabled={loadingId === item.id}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                    No hay productos en este pedido.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-zinc-50 dark:bg-zinc-800/50 font-medium text-zinc-900 dark:text-zinc-50">
                        <tr>
                            <td colSpan={2}></td>
                            <td className="px-6 py-4 text-right text-lg font-bold">Total:</td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                                ${initialTotal.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {isModalOpen && (
                <AddProductToOrderModal 
                    orderId={orderId} 
                    onClose={() => setIsModalOpen(false)} 
                    onWarning={(msg) => setWarning(msg)}
                />
            )}
        </div>
    );
}
