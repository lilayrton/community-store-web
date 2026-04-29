"use client";

import { useState } from "react";
import { CatalogProduct, updateProductDetails } from "@/actions/admin/catalog-actions";
import { X, Loader2, Save } from "lucide-react";

interface Props {
    product: CatalogProduct;
    onClose: () => void;
    onSave: (updatedProduct: CatalogProduct) => void;
}

export default function EditProductModal({ product, onClose, onSave }: Props) {
    const [formData, setFormData] = useState({
        name: product.name,
        category: product.category,
        provider: product.provider || "",
        price: product.price.toString(),
        packageType: product.packageType || "Unidad",
        packageQuantity: product.packageQuantity?.toString() || "1",
    });
    
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        const priceNum = parseFloat(formData.price) || 0;
        const qtyNum = parseInt(formData.packageQuantity) || 1;

        const res = await updateProductDetails(product.id, {
            name: formData.name,
            category: formData.category,
            provider: formData.provider || null,
            price: priceNum,
            packageType: formData.packageType,
            packageQuantity: qtyNum
        });

        if (res.success && res.product) {
            onSave(res.product);
        } else {
            alert("Error al actualizar el producto");
        }
        
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Editar Producto</h3>
                    <button onClick={onClose} type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Nombre del producto</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Categoría</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Almacen">Almacén</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Frescos">Frescos</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Kiosco">Kiosco</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Proveedor (Opcional)</label>
                                <input
                                    type="text"
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleChange}
                                    placeholder="Ej: Mayorista X"
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Precio Total (Venta al público)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de Empaque</label>
                                <select
                                    name="packageType"
                                    value={formData.packageType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Unidad">Unidad</option>
                                    <option value="Fraccion">Fracción</option>
                                    <option value="Display">Display</option>
                                    <option value="Bolsa">Bolsa</option>
                                    <option value="Caja">Caja</option>
                                    <option value="Carton">Cartón</option>
                                    <option value="Tira">Tira</option>
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Unidades</label>
                                <input
                                    type="number"
                                    name="packageQuantity"
                                    value={formData.packageQuantity}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Precio Unitario Calculado:</span>
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                                ${(parseFloat(formData.price) / (parseInt(formData.packageQuantity) || 1) || 0).toLocaleString('es-AR', {maximumFractionDigits:2})}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex justify-end gap-2 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
