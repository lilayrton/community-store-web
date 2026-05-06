"use client";

import { useState, useMemo, useEffect } from "react";
import { CatalogProduct, searchProducts, getQuinteroProducts } from "@/actions/admin/catalog-actions";
import { Search, Save, Package, Plus, X, Loader2, Copy, RotateCcw, ChevronDown, PackageOpen, ChevronUp, GripVertical, MoreVertical, Trash2, FolderPlus, ChevronRight } from "lucide-react";

interface CatalogEditorProps {
    initialProducts: CatalogProduct[];
    onPublish: (products: CatalogProduct[]) => void;
    onBack: () => void;
}

export default function CatalogEditor({ initialProducts, onPublish, onBack }: CatalogEditorProps) {
    const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Group State
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [availableProviders, setAvailableProviders] = useState<string[]>(['Quintero', 'Sin Asignar']);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [activeProviderForNew, setActiveProviderForNew] = useState<string>('Sin Asignar');
    const [isDestinoDropdownOpen, setIsDestinoDropdownOpen] = useState(false);
    const [isMobileDestinoOpen, setIsMobileDestinoOpen] = useState(false);

    // Add Product Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Manual Creation State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualProduct, setManualProduct] = useState({
        name: "",
        category: "General",
        price: "",
        variants: [] as string[],
        newVariant: "",
        packageType: "Unidad",
        packageQuantity: 1
    });

    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const provs = new Set(availableProviders);
        products.forEach(p => {
             if (p.provider && !provs.has(p.provider)) {
                 provs.add(p.provider);
             }
        });
        setAvailableProviders(Array.from(provs));
    }, [products]);

    const toggleGroupCollapse = (groupName: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) next.delete(groupName);
            else next.add(groupName);
            return next;
        });
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        setAvailableProviders(prev => Array.from(new Set([...prev, newGroupName.trim()])));
        setNewGroupName("");
        setIsGroupModalOpen(false);
    };

    const handleProviderChange = (id: string, newProvider: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, provider: newProvider === 'Sin Asignar' ? null : newProvider } : p));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    const groupedProducts = useMemo(() => {
        const groups: Record<string, CatalogProduct[]> = {};
        availableProviders.forEach(p => groups[p] = []);
        
        filteredProducts.forEach(p => {
            const prov = p.provider || 'Sin Asignar';
            if (!groups[prov]) groups[prov] = [];
            groups[prov].push(p);
        });
        
        const sortedKeys = availableProviders.filter(key => groups[key] && groups[key].length > 0);
        Object.keys(groups).forEach(k => {
            if (!sortedKeys.includes(k) && groups[k].length > 0) sortedKeys.push(k);
        });
        
        return sortedKeys.map(key => ({
            name: key,
            products: groups[key]
        }));
    }, [filteredProducts, availableProviders]);

    const activeCount = products.filter(p => p.isActive).length;

    // Handlers
    const handlePriceChange = (id: string, newPrice: string) => {
        const price = parseFloat(newPrice);
        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;

            const safePrice = isNaN(price) ? 0 : price;
            let newUnitPrice = p.unitPrice;

            if (p.packageQuantity && p.packageQuantity > 0) {
                newUnitPrice = safePrice / p.packageQuantity;
            }

            return { ...p, price: safePrice, unitPrice: newUnitPrice };
        }));
    };

    const handlePackageTypeChange = (id: string, newType: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, packageType: newType } : p));
    };

    const handlePackageQuantityChange = (id: string, newQuantity: string) => {
        const quantity = parseInt(newQuantity);
        if (isNaN(quantity)) return;

        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;
            let newUnitPrice = p.unitPrice;
            if (quantity > 0 && p.price > 0) {
                newUnitPrice = p.price / quantity;
            }
            return { ...p, packageQuantity: quantity, unitPrice: newUnitPrice };
        }));
    };

    const handleToggleActive = (id: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const handleRemoveProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleMoveGroup = (e: React.MouseEvent, groupName: string, direction: 'up' | 'down') => {
        e.stopPropagation();
        setAvailableProviders(prev => {
            const newOrder = [...prev];
            const idx = newOrder.indexOf(groupName);
            if (idx === -1) return prev;
            
            if (direction === 'up' && idx > 0) {
                [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
            } else if (direction === 'down' && idx < newOrder.length - 1) {
                [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
            }
            return newOrder;
        });
    };

    const handleSearchProducts = async (term: string) => {
        setProductSearch(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchProducts(term);
            const existingIds = new Set(products.map(p => p.id));
            setSearchResults(results.filter(r => !existingIds.has(r.id)));
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddProduct = (product: CatalogProduct) => {
        const targetProvider = activeProviderForNew === 'Sin Asignar' ? null : activeProviderForNew;
        setProducts(prev => [...prev, { ...product, provider: targetProvider }]);
        setSearchResults(prev => prev.filter(r => r.id !== product.id));
    };

    const handleAddVariant = () => {
        if (!manualProduct.newVariant.trim()) return;
        setManualProduct(prev => ({ ...prev, variants: [...prev.variants, prev.newVariant.trim()], newVariant: "" }));
    };

    const handleRemoveVariant = (index: number) => {
        setManualProduct(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    const handleCreateManual = () => {
        if (!manualProduct.name) return;

        const productsToCreate: CatalogProduct[] = [];
        const baseTimestamp = Date.now();

        if (manualProduct.variants.length > 0) {
            manualProduct.variants.forEach((variant, index) => {
                productsToCreate.push({
                    id: `MANUAL-${baseTimestamp}-${index}`,
                    name: `${manualProduct.name} ${variant}`,
                    price: parseFloat(manualProduct.price) || 0,
                    category: manualProduct.category,
                    format: null,
                    unitPrice: null,
                    stock: 0,
                    packageType: manualProduct.packageType || "Unidad",
                    packageQuantity: Number(manualProduct.packageQuantity) || 1,
                    isActive: true,
                    isStockTracked: false,
                    provider: activeProviderForNew === 'Sin Asignar' ? null : activeProviderForNew
                });
            });
        } else {
            productsToCreate.push({
                id: `MANUAL-${baseTimestamp}`,
                name: manualProduct.name,
                price: parseFloat(manualProduct.price) || 0,
                category: manualProduct.category,
                format: null,
                unitPrice: null,
                stock: 0,
                packageType: manualProduct.packageType || "Unidad",
                packageQuantity: Number(manualProduct.packageQuantity) || 1,
                isActive: true,
                isStockTracked: false,
                provider: activeProviderForNew === 'Sin Asignar' ? null : activeProviderForNew
            });
        }

        setProducts(prev => [...prev, ...productsToCreate]);
        setIsManualModalOpen(false);
        setManualProduct({ name: "", category: "General", price: "", variants: [], newVariant: "", packageType: "Unidad", packageQuantity: 1 });
    };

    // Draft Logic
    useEffect(() => {
        const savedDraft = localStorage.getItem("catalog-editor-draft");
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setProducts(parsed);
                }
            } catch (e) {}
        }
    }, []);

    const getSortedProductsToPublish = () => {
        const groups: Record<string, CatalogProduct[]> = {};
        availableProviders.forEach(p => groups[p] = []);
        products.forEach(p => {
            const prov = p.provider || 'Sin Asignar';
            if (!groups[prov]) groups[prov] = [];
            groups[prov].push(p);
        });
        const sortedKeys = availableProviders.filter(key => groups[key]);
        Object.keys(groups).forEach(k => {
            if (!sortedKeys.includes(k)) sortedKeys.push(k);
        });
        return sortedKeys.flatMap(k => groups[k]);
    };

    // Auto-save effect
    useEffect(() => {
        if (products.length === 0) return;
        const timeoutId = setTimeout(() => {
            localStorage.setItem("catalog-editor-draft", JSON.stringify(getSortedProductsToPublish()));
            setLastSaved(new Date());
        }, 1500); // 1.5s debounce
        return () => clearTimeout(timeoutId);
    }, [products, availableProviders]);

    const handleSaveDraft = () => {
        localStorage.setItem("catalog-editor-draft", JSON.stringify(getSortedProductsToPublish()));
        setLastSaved(new Date());
        alert("¡Progreso guardado! (Igualmente, se guarda automáticamente en cada cambio)");
    };

    const handleResetDraft = () => {
        if (window.confirm("¿Estás seguro de que deseas reiniciar? Se perderá el progreso actual no guardado.")) {
            localStorage.removeItem("catalog-editor-draft");
            setProducts(initialProducts);
        }
    };

    const handleCopyList = () => {
        const activeProducts = products.filter(p => p.isActive);
        if (activeProducts.length === 0) return;

        let output = "";
        
        groupedProducts.forEach(group => {
            const groupActive = group.products.filter(p => p.isActive);
            if (groupActive.length === 0) return;
            
            output += `📦 === ${group.name.toUpperCase()} ===\n\n`;
            
            let i = 0;
            while (i < groupActive.length) {
                 const current = groupActive[i];
                 let variants: CatalogProduct[] = [current];
                 let lockedPrefix = "";

                 if (i + 1 < groupActive.length) {
                     const next = groupActive[i + 1];

                     if (next.price === current.price) {
                         let commonPrefix = "";
                         for (let k = 0; k < Math.min(current.name.length, next.name.length); k++) {
                             if (current.name[k] === next.name[k]) {
                                 commonPrefix += current.name[k];
                             } else {
                                 break;
                             }
                         }

                         const lastSpaceIndex = commonPrefix.lastIndexOf(' ');

                         if (lastSpaceIndex !== -1) {
                             const wordPrefix = commonPrefix.substring(0, lastSpaceIndex + 1);

                             if (wordPrefix.length >= 4) {
                                 lockedPrefix = wordPrefix;
                                 variants.push(next);

                                 let j = i + 2;
                                 while (j < groupActive.length) {
                                     const sub = groupActive[j];
                                     if (sub.price === current.price && sub.name.startsWith(lockedPrefix)) {
                                         variants.push(sub);
                                         j++;
                                     } else {
                                         break;
                                     }
                                 }
                             }
                         }
                     }
                 }

                 if (variants.length > 1) {
                     const baseName = lockedPrefix.trim();
                     const packageInfo = current.packageType && current.packageQuantity
                         ? `${current.packageType} x${current.packageQuantity}uni`
                         : "Unidad";

                     output += `🔴 ${baseName}\n`;
                     output += ` ${packageInfo}\n`;
                     output += `$${current.price}\n`;
                     if (current.unitPrice) output += `$${Math.round(current.unitPrice)} c/u\n`;

                     variants.forEach(v => {
                         const variantName = v.name.replace(lockedPrefix, "").trim();
                         output += `🔹 ${variantName || v.name}\n`;
                     });
                     output += "\n";

                     i += variants.length;
                 } else {
                     const packageInfo = current.packageType && current.packageQuantity
                         ? `${current.packageType} x${current.packageQuantity}uni`
                         : "Unidad";

                     output += `🔴 ${current.name}\n`;
                     output += ` ${packageInfo}\n`;
                     output += `$${current.price}\n`;
                     if (current.unitPrice) output += `$${Math.round(current.unitPrice)} c/u\n`;
                     output += "\n";

                     i++;
                 }            
            }
        });

        navigator.clipboard.writeText(output);
        alert("¡Lista copiada al portapapeles!");
    };


    const [loadingQuintero, setLoadingQuintero] = useState(false);
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

    const handleImportQuintero = () => {
        setIsImportConfirmOpen(true);
    };

    const executeImportQuintero = async () => {
        setIsImportConfirmOpen(false);
        setLoadingQuintero(true);
        try {
            const quinteroProducts = await getQuinteroProducts();

            const currentIds = new Set(products.map(p => p.id));
            const newProducts = quinteroProducts.filter(p => !currentIds.has(p.id));

            if (newProducts.length === 0) {
                alert("Todos los productos de Quintero ya están en la lista.");
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }
        } catch (error) {
            console.error(error);
            alert("Error al importar productos.");
        } finally {
            setLoadingQuintero(false);
        }
    };

    const handleMoveProduct = (productId: string, direction: 'up' | 'down') => {
        if (search) return;

        setProducts(prev => {
            const newProducts = [...prev];
            const currentIndex = newProducts.findIndex(p => p.id === productId);
            if (currentIndex === -1) return prev;
            
            const p = newProducts[currentIndex];
            const prov = p.provider || 'Sin Asignar';

            let targetIndex = -1;
            if (direction === 'up') {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if ((newProducts[i].provider || 'Sin Asignar') === prov) {
                        targetIndex = i;
                        break;
                    }
                }
            } else {
                for (let i = currentIndex + 1; i < newProducts.length; i++) {
                    if ((newProducts[i].provider || 'Sin Asignar') === prov) {
                        targetIndex = i;
                        break;
                    }
                }
            }

            if (targetIndex !== -1) {
                [newProducts[currentIndex], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[currentIndex]];
            }
            
            return newProducts;
        });
    };

    return (
        <div className="space-y-6 pb-24 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Toolbars */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Volver"
                    >
                        ←
                    </button>
                    <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex-1 truncate">Editor de Catálogo</h1>
                </div>

                {/* Toolbar */}
                <div className="flex gap-2 items-center bg-transparent md:bg-zinc-50 md:dark:bg-zinc-800/50 md:p-2 rounded-xl border-0 md:border md:border-zinc-200 dark:border-zinc-700">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 md:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm shadow-sm md:shadow-none"
                        />
                    </div>

                    <div className="md:hidden relative">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                                <div className="p-2 border-b border-zinc-200 dark:border-zinc-700 mb-1">
                                    <div className="text-xs font-bold text-zinc-500 mb-1.5">Destino Nuevos:</div>
                                    <button 
                                        onClick={() => setIsMobileDestinoOpen(!isMobileDestinoOpen)}
                                        className="w-full flex justify-between items-center bg-zinc-100 dark:bg-zinc-900 text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <span className="truncate font-medium">{activeProviderForNew}</span>
                                        <ChevronDown size={14} className="text-zinc-400" />
                                    </button>
                                    {isMobileDestinoOpen && (
                                        <div className="mt-2 flex flex-col gap-0.5 bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 p-1">
                                            {availableProviders.map(p => (
                                                <button
                                                    key={`mob-drop-${p}`}
                                                    onClick={() => { setActiveProviderForNew(p); setIsMobileDestinoOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                        activeProviderForNew === p ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => { setIsAddModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 w-full text-left">
                                    <Search size={16} /> Buscar Modal
                                </button>
                                <button onClick={() => { setIsManualModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-sm text-purple-700 dark:text-purple-300 font-medium w-full text-left">
                                    <Plus size={16} /> Crear manual
                                </button>
                                <button onClick={() => { setIsGroupModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-sm text-orange-700 dark:text-orange-300 font-medium w-full text-left">
                                    <FolderPlus size={16} /> Crear proveedor
                                </button>
                                <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700 my-1" />
                                <button onClick={() => { handleImportQuintero(); setIsMobileMenuOpen(false); }} disabled={loadingQuintero} className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm text-blue-700 dark:text-blue-300 w-full text-left">
                                    <Package size={16} /> Quintero
                                </button>
                                <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700 my-1" />
                                <button onClick={() => { handleCopyList(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 w-full text-left">
                                    <Copy size={16} /> Exportar
                                </button>
                                <button onClick={() => { handleResetDraft(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm text-red-600 dark:text-red-400 w-full text-left">
                                    <RotateCcw size={16} /> Limpiar Todo
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex gap-2 items-center">
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors">
                            <Search size={16} />
                            Buscar
                        </button>
                        <button onClick={() => setIsManualModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg text-sm font-bold border border-purple-200 dark:border-purple-800 transition-colors">
                            <Plus size={16} />
                            Crear
                        </button>
                        <button onClick={() => setIsGroupModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg text-sm font-bold border border-orange-200 dark:border-orange-800 transition-colors">
                            <FolderPlus size={16} />
                            Proveedor
                        </button>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                        {/* Selector Destino Nuevos */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDestinoDropdownOpen(!isDestinoDropdownOpen)}
                                className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-inner hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Destino:</span>
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">{activeProviderForNew}</span>
                                <ChevronDown size={14} className="text-zinc-400" />
                            </button>

                            {isDestinoDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDestinoDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        {availableProviders.map(p => (
                                            <button
                                                key={`desk-drop-${p}`}
                                                onClick={() => { setActiveProviderForNew(p); setIsDestinoDropdownOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    activeProviderForNew === p 
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />
                        
                        <button onClick={handleImportQuintero} disabled={loadingQuintero} className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {loadingQuintero ? <Loader2 className="animate-spin" size={16} /> : <Package size={16} />}
                            Quintero
                        </button>

                        <button onClick={handleResetDraft} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Reiniciar todo (Borrar progreso)">
                            <RotateCcw size={16} />
                        </button>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                        <div className="mr-2 text-sm text-zinc-500">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeCount}</span> activos
                        </div>

                        <button onClick={handleCopyList} className="p-2 mr-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Copiar Lista para WhatsApp">
                            <Copy size={20} />
                        </button>

                        <button onClick={() => onPublish(getSortedProductsToPublish())} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-md shadow-blue-500/20 text-sm">
                            <Save size={16} />
                            Guardar Catálogo 🚀
                        </button>
                    </div>
                </div>
            </div>

            {/* Render Groups (Accordions) */}
            <div className="space-y-4">
                {groupedProducts.map((group) => {
                    if (group.products.length === 0) return null;
                    const isCollapsed = collapsedGroups.has(group.name);
                    const groupColor = group.name === 'Quintero' ? 'bg-red-600' : group.name === 'Sin Asignar' ? 'bg-zinc-700' : 'bg-blue-600';

                    return (
                        <div key={group.name} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div 
                                onClick={() => toggleGroupCollapse(group.name)}
                                className={`w-full flex items-center justify-between p-4 ${groupColor} text-white transition-opacity hover:opacity-90 cursor-pointer`}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                    <h3 className="font-bold uppercase tracking-wide truncate">{group.name}</h3>
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-2 font-mono">{group.products.length}</span>
                                </div>
                                <div className="flex gap-1 items-center bg-black/20 rounded-lg p-0.5 ml-4" onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => handleMoveGroup(e, group.name, 'up')} className="p-1 hover:bg-white/20 rounded-md transition-colors disabled:opacity-30" title="Mover Arriba" disabled={groupedProducts.findIndex(g => g.name === group.name) === 0}>
                                        <ChevronUp size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-white/20 mx-0.5"></div>
                                    <button onClick={(e) => handleMoveGroup(e, group.name, 'down')} className="p-1 hover:bg-white/20 rounded-md transition-colors disabled:opacity-30" title="Mover Abajo" disabled={groupedProducts.findIndex(g => g.name === group.name) === groupedProducts.length - 1}>
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            {!isCollapsed && (
                                <>
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                                <tr>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm w-12 text-center">#</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm w-16 text-center">Orden</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm">Producto</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm w-32">Proveedor</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm w-48">Empaque</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm">Unit.</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm">Venta</th>
                                                    <th className="p-4 font-medium text-zinc-500 text-sm w-12 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {group.products.map((product, index) => (
                                                    <tr key={product.id} className={`group transition-colors ${!product.isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/50 opacity-60 grayscale' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" checked={product.isActive} onChange={() => handleToggleActive(product.id)} className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex flex-col items-center gap-0">
                                                                <button onClick={() => handleMoveProduct(product.id, 'up')} disabled={index === 0 || search !== ""} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30">
                                                                    <ChevronUp size={16} />
                                                                </button>
                                                                <button onClick={() => handleMoveProduct(product.id, 'down')} disabled={index === group.products.length - 1 || search !== ""} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30">
                                                                    <ChevronDown size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</div>
                                                            <div className="text-xs text-zinc-400 font-mono">ID: {product.id.substring(0, 8)}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="relative inline-flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg w-full border border-zinc-200 dark:border-zinc-700">
                                                                <select value={product.provider || 'Sin Asignar'} onChange={(e) => handleProviderChange(product.id, e.target.value)} className="appearance-none bg-transparent border-none text-sm font-medium text-zinc-700 dark:text-zinc-300 w-full pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:ring-0">
                                                                    {availableProviders.map(p => <option key={p} value={p}>{p}</option>)}
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-2 text-zinc-400 pointer-events-none" />
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                                <div className="relative flex-1">
                                                                    <select value={product.packageType || 'Unidad'} onChange={(e) => handlePackageTypeChange(product.id, e.target.value)} className="appearance-none bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 w-full pl-2 pr-6 py-1.5 outline-none cursor-pointer focus:ring-0">
                                                                        <option value="Unidad">Uni</option>
                                                                        <option value="Fraccion">Frac</option>
                                                                        <option value="Display">Disp</option>
                                                                        <option value="Bolsa">Bol</option>
                                                                        <option value="Caja">Caja</option>
                                                                        <option value="Carton">Cart</option>
                                                                    </select>
                                                                    <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                                                </div>
                                                                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                                                <div className="flex items-center px-1.5 bg-white dark:bg-zinc-900">
                                                                    <span className="text-zinc-400 font-bold text-[10px]">x</span>
                                                                    <input type="number" value={product.packageQuantity || 1} onChange={(e) => handlePackageQuantityChange(product.id, e.target.value)} className="w-10 bg-transparent border-none text-xs font-black text-zinc-700 dark:text-zinc-300 text-center outline-none py-1.5 focus:ring-0 p-0" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs font-mono text-zinc-500">
                                                            {product.unitPrice ? `$${product.unitPrice.toLocaleString('es-AR', {minimumFractionDigits: product.unitPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: 2})}` : '—'}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="relative max-w-[120px]">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                                                <input type="number" value={product.price} onChange={(e) => handlePriceChange(product.id, e.target.value)} className="w-full pl-6 pr-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 font-bold" />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button onClick={() => handleRemoveProduct(product.id)} className="text-zinc-400 hover:text-red-500 transition-colors" title="Eliminar">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards For Group */}
                                    <div className="md:hidden flex flex-col gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/30">
                                        {group.products.map((product, index) => (
                                            <div key={`mobile-${product.id}`} className={`bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-700 ${!product.isActive ? 'opacity-60 grayscale bg-zinc-50 dark:bg-zinc-800/80' : ''}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-3 items-start pr-2">
                                                        <input type="checkbox" checked={product.isActive} onChange={() => handleToggleActive(product.id)} className="w-6 h-6 rounded border-zinc-300 text-blue-600 mt-0.5" />
                                                        <div>
                                                            <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">{product.name}</div>
                                                            <div className="text-xs text-zinc-400 font-mono mt-1">ID: {product.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <button onClick={() => handleMoveProduct(product.id, 'up')} disabled={index === 0 || search !== ""} className="p-1.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button onClick={() => handleMoveProduct(product.id, 'down')} disabled={index === group.products.length - 1 || search !== ""} className="p-1.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                                            <ChevronDown size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mb-5">
                                                    {/* Provider Badge */}
                                                    <div className="relative inline-flex items-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/30 rounded-lg">
                                                        <div className="pointer-events-none absolute left-2 flex items-center">
                                                            <FolderPlus size={12} className="text-orange-500" />
                                                        </div>
                                                        <select 
                                                            value={product.provider || 'Sin Asignar'} 
                                                            onChange={(e) => handleProviderChange(product.id, e.target.value)} 
                                                            className="appearance-none bg-transparent border-none text-xs font-bold text-orange-700 dark:text-orange-300 pl-6 pr-6 py-1.5 outline-none cursor-pointer focus:ring-0"
                                                        >
                                                            {availableProviders.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                        <div className="pointer-events-none absolute right-2 flex items-center">
                                                            <ChevronDown size={12} className="text-orange-400" />
                                                        </div>
                                                    </div>

                                                    {/* Package Badge Group */}
                                                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                                        <div className="relative flex items-center">
                                                            <div className="pointer-events-none absolute left-2 flex items-center">
                                                                <Package size={12} className="text-zinc-400" />
                                                            </div>
                                                            <select 
                                                                value={product.packageType || 'Unidad'} 
                                                                onChange={(e) => handlePackageTypeChange(product.id, e.target.value)} 
                                                                className="appearance-none bg-transparent border-none text-xs font-bold text-zinc-700 dark:text-zinc-300 pl-6 pr-6 py-1.5 outline-none cursor-pointer focus:ring-0"
                                                            >
                                                                <option value="Unidad">Unidad</option>
                                                                <option value="Fraccion">Fracción</option>
                                                                <option value="Display">Display</option>
                                                                <option value="Bolsa">Bolsa</option>
                                                                <option value="Caja">Caja</option>
                                                                <option value="Carton">Cartón</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute right-2 flex items-center">
                                                                <ChevronDown size={12} className="text-zinc-400" />
                                                            </div>
                                                        </div>
                                                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                                        <div className="flex items-center px-2 bg-zinc-50 dark:bg-zinc-800/50">
                                                            <span className="text-zinc-400 font-bold text-[10px]">x</span>
                                                            <input 
                                                                type="number" 
                                                                value={product.packageQuantity || 1} 
                                                                onChange={(e) => handlePackageQuantityChange(product.id, e.target.value)} 
                                                                className="w-8 bg-transparent border-none text-xs font-black text-zinc-700 dark:text-zinc-300 text-center outline-none py-1.5 focus:ring-0 p-0" 
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1"></div>

                                                    {/* Trash Action */}
                                                    <button onClick={() => handleRemoveProduct(product.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center border border-transparent hover:border-red-200 dark:hover:border-red-800/50">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-zinc-500 flex flex-col">
                                                            <span className="uppercase tracking-wider font-bold opacity-70">Unitario</span>
                                                            <span className="font-mono mt-0.5 text-zinc-400">
                                                                {product.unitPrice ? `${product.unitPrice.toLocaleString('es-AR', {minimumFractionDigits: product.unitPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: 2})}` : '—'}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 font-black text-lg">$</span>
                                                                <input type="number" value={product.price} onChange={(e) => handlePriceChange(product.id, e.target.value)} className="w-32 pl-8 pr-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 font-black text-xl text-right text-blue-700 dark:text-blue-400 focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                
                {filteredProducts.length === 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 p-12 text-center text-zinc-400 shadow-sm">
                        No se encontraron productos con estos filtros.
                    </div>
                )}
            </div>

            {/* Quintero Import Confirmation Modal */}
            {isImportConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                            <PackageOpen size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">¿Importar Quintero?</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Agregarás automáticamente los productos bajo stock trackeado al panel. Se clasificarán en "Quintero".</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setIsImportConfirmOpen(false)} className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors">Cancelar</button>
                            <button onClick={executeImportQuintero} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors">Importar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Provider Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <FolderPlus size={20} className="text-orange-500"/> Nuevo Proveedor
                            </h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                        </div>
                        <input type="text" autoFocus placeholder="Ej: Verdulería Juan" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 rounded-lg focus:ring-2 focus:ring-orange-500 mb-4 outline-none" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Cancelar</button>
                            <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-bold">Crear Proveedor</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh]">
                        <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                            <Search className="text-zinc-400" size={20} />
                            <input autoFocus type="text" placeholder="Buscar producto para agregar..." value={productSearch} onChange={(e) => handleSearchProducts(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 text-lg" />
                            <div className="w-5">{isSearching && <Loader2 className="animate-spin text-blue-500" size={20} />}</div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"><X size={24} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                            {searchResults.length > 0 ? (
                                <ul className="space-y-1">
                                    {searchResults.map((result) => (
                                        <li key={result.id} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-lg cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all" onClick={() => handleAddProduct(result)}>
                                            <div className="pr-4">
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{result.name}</div>
                                                <div className="text-xs text-zinc-500 flex gap-2"><span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600">{result.category}</span><span className="font-mono">ID: {result.id.substring(0, 8)}</span></div>
                                            </div>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg font-medium text-sm transition-colors border border-blue-200/50 dark:border-blue-800/50"><Plus size={16} />Agregar</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : productSearch.length >= 2 ? (
                                <div className="text-center p-12 text-zinc-500 flex flex-col items-center">
                                    <Package size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                                    <p>No hay resultados para "{productSearch}"</p>
                                    <button onClick={() => { setIsAddModalOpen(false); setIsManualModalOpen(true); setManualProduct(prev => ({ ...prev, name: productSearch })); }} className="mt-4 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg text-sm transition-colors hover:scale-105">Crear "{productSearch}" manualmente</button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Manual Product Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/10">
                            <h2 className="font-black text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2"><Plus size={20} className="text-purple-600" />Crear Producto Manual</h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-purple-400 hover:text-purple-900 dark:hover:text-purple-200"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Nombre del Producto *</label>
                                <input type="text" value={manualProduct.name} onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })} placeholder="Ej: Jabón Ala Matic" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-zinc-950 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Categoría</label>
                                    <select value={manualProduct.category} onChange={e => setManualProduct({ ...manualProduct, category: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 outline-none">
                                        <option value="General">General</option>
                                        <option value="Limpieza">Limpieza</option>
                                        <option value="Almacén">Almacén</option>
                                        <option value="Bebidas">Bebidas</option>
                                        <option value="Frescos">Frescos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Precio Venta (Opcional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                        <input type="number" value={manualProduct.price} onChange={e => setManualProduct({ ...manualProduct, price: e.target.value })} className="w-full pl-7 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Empaque</label>
                                    <select value={manualProduct.packageType} onChange={e => setManualProduct({ ...manualProduct, packageType: e.target.value })} className="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-sm">
                                        <option value="Unidad">Unidad</option><option value="Fraccion">Fracción</option><option value="Display">Display</option><option value="Bolsa">Bolsa</option><option value="Caja">Caja</option><option value="Carton">Cartón</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Cant. por {manualProduct.packageType}</label>
                                    <input type="number" value={manualProduct.packageQuantity} onChange={e => setManualProduct({ ...manualProduct, packageQuantity: parseInt(e.target.value) || 1 })} className="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-sm" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Variantes Rápidas (Opcional)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={manualProduct.newVariant} onChange={e => setManualProduct({ ...manualProduct, newVariant: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariant(); } }} placeholder="Ej: Lavanda" className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 outline-none text-sm" />
                                    <button onClick={handleAddVariant} className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-sm font-bold">Añadir</button>
                                </div>
                                {manualProduct.variants.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                                        {manualProduct.variants.map((v, i) => (
                                            <span key={i} className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm">
                                                {v}
                                                <button onClick={() => handleRemoveVariant(i)} className="hover:text-purple-900 dark:hover:text-purple-100"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex justify-end gap-2">
                            <button onClick={() => setIsManualModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Cancelar</button>
                            <button onClick={handleCreateManual} disabled={!manualProduct.name} className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {manualProduct.variants.length > 0 ? `Crear ${manualProduct.variants.length} Productos` : 'Crear Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sticky Footer */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 py-3 px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-40 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)]">
                <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/50 flex flex-col items-center justify-center min-w-[3.5rem]">
                        <span className="font-black text-lg leading-none">{activeCount}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-80 mt-0.5">Activos</span>
                    </div>
                </div>
                <div className="flex gap-2.5">
                    <button onClick={handleSaveDraft} className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors shadow-sm">
                        Guardar
                    </button>
                    <button onClick={() => onPublish(getSortedProductsToPublish())} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center gap-2">
                        Lanzar 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}

