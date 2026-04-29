"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    Minus,
    ShoppingBag,
    Truck,
    Store as StoreIcon,
    Search,
    Trash2,
    X,
    Info
} from "lucide-react";

export type Product = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image?: string | null;
};

type CartItem = Product & {
    quantity: number;
};

type DeliveryMethod = "pickup" | "delivery";

interface StoreClientProps {
    products: Product[];
    storeName: string;
}

export default function StoreClient({ products, storeName }: StoreClientProps) {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);

    // Cargar pedido guardado al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem("checkout_cart");
        const savedDelivery = localStorage.getItem("checkout_delivery");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error al cargar carrito", e);
            }
        }
        if (savedDelivery) {
            setDeliveryMethod(savedDelivery as DeliveryMethod);
        }
        setIsInitialized(true);
    }, []);

    // Guardar pedido cada vez que cambia
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("checkout_cart", JSON.stringify(cart));
            localStorage.setItem("checkout_delivery", deliveryMethod);
        }
    }, [cart, deliveryMethod, isInitialized]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsCartVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1, // Trigger when at least 10% of cart is visible
            }
        );

        if (cartRef.current) {
            observer.observe(cartRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        if (selectedProduct) setSelectedProduct(null);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const clearCart = () => setCart([]);

    const scrollToCart = () => {
        document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-zinc-900">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-zinc-800 tracking-tight hidden md:flex items-center gap-2 uppercase">
                        <StoreIcon className="w-6 h-6 text-blue-600" />
                        {storeName}
                    </h1>

                    <div className="flex-1 max-w-lg relative">
                        <Search className="absolute left-4 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-full border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-zinc-800 font-medium placeholder:text-zinc-400 shadow-inner"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Product List */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Onboarding Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-100 p-2 rounded-full mt-1 shrink-0">
                            <Info className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 text-lg">¿Cómo armar tu pedido?</h3>
                            <p className="text-blue-800 mt-1 font-medium leading-relaxed">
                                Revisá la lista de productos abajo y hacé clic en el botón <strong className="bg-orange-500 px-2 py-0.5 rounded-md text-white shadow-sm inline-flex items-center mx-1"><Plus className="w-4 h-4 mr-1"/> Agregar</strong> para sumarlo a tu pedido. 
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        {filteredProducts.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500 font-medium">
                                No se encontraron productos.
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {filteredProducts.map(product => {
                                    const inCart = cart.find(i => i.id === product.id);

                                    return (
                                        <div key={product.id} className="p-4 sm:p-5 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                                            
                                            {/* Product Info */}
                                            <div className="flex-1 flex gap-4 w-full">
                                                {product.image && (
                                                    <div
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-zinc-200"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-bold text-zinc-900 text-base sm:text-lg">
                                                            {product.name}
                                                        </h3>
                                                        <span className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full font-semibold uppercase tracking-wider">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                                                        {product.description}
                                                    </p>
                                                    <div className="mt-3 font-black text-slate-900 text-lg">
                                                        ${product.price.toLocaleString("es-AR")}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add/Remove Controls */}
                                            <div className="w-full sm:w-auto flex items-center justify-end gap-3 mt-2 sm:mt-0">
                                                {inCart ? (
                                                    <div className="flex items-center gap-4 bg-white border border-orange-200 rounded-full px-2 py-1.5 shadow-sm">
                                                        <button
                                                            onClick={() => removeFromCart(product.id)}
                                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-orange-500 border border-orange-500 shadow-sm hover:bg-orange-50 transition-colors"
                                                        >
                                                            <Minus className="w-5 h-5" />
                                                        </button>
                                                        <span className="font-bold text-slate-900 text-lg w-6 text-center">
                                                            {inCart.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-md shadow-orange-500/30 hover:bg-orange-600 transition-colors"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl transition-colors shadow-sm"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                        <span>Agregar</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Cart Sidebar */}
                <div id="cart-section" ref={cartRef} className="lg:col-span-1 scroll-mt-24">
                    <div className="sticky top-24 bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col max-h-[calc(100vh-8rem)]">

                        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
                            <h2 className="font-black text-xl flex items-center gap-2 text-zinc-800">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                                Tu Pedido
                            </h2>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Vaciar
                                </button>
                            )}
                        </div>

                        <div className="p-5 border-b border-zinc-100">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeliveryMethod("pickup")}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === "pickup"
                                        ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                                        : "border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:bg-zinc-50"
                                        }`}
                                >
                                    <StoreIcon className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                    <span className="text-sm font-bold uppercase tracking-wide">Retiro</span>
                                </button>
                                <button
                                    onClick={() => setDeliveryMethod("delivery")}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === "delivery"
                                        ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                                        : "border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:bg-zinc-50"
                                        }`}
                                >
                                    <Truck className={`w-6 h-6 ${deliveryMethod === 'delivery' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                    <span className="text-sm font-bold uppercase tracking-wide">Delivery</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[250px]">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 opacity-70">
                                    <ShoppingBag className="w-16 h-16" />
                                    <p className="font-medium text-lg">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-zinc-100 shadow-sm">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="font-bold text-zinc-800 text-sm leading-snug line-clamp-2">{item.name}</p>
                                                <p className="text-zinc-500 text-xs font-medium mt-0.5">${item.price}</p>
                                            </div>
                                            <span className="font-black text-slate-900 text-sm shrink-0">
                                                ${(item.price * item.quantity).toLocaleString("es-AR")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <button 
                                                onClick={() => {
                                                    // Little trick: call removeFromCart quantity times to clear it completely if they want to delete, or just provide a trash icon
                                                    // For now, we'll just have the +/- buttons
                                                }}
                                                className="text-xs text-zinc-400 hover:text-red-500 flex items-center opacity-0 pointer-events-none"
                                            >
                                                {/* Hidden spacer to push controls right */}
                                            </button>
                                            <div className="flex items-center gap-3 bg-white border border-orange-200 rounded-full px-1.5 py-1 shadow-sm">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-orange-500 border border-orange-500 shadow-sm hover:bg-orange-50 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-bold text-slate-900 text-sm w-5 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="w-7 h-7 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-md shadow-orange-500/30 hover:bg-orange-600 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-zinc-50 rounded-b-2xl border-t border-zinc-200 shadow-inner">
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toLocaleString("es-AR")}</span>
                                </div>
                                {deliveryMethod === "delivery" && (
                                    <div className="flex justify-between text-zinc-500 font-medium">
                                        <span>Costo de Envío</span>
                                        <span>$1,500</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-zinc-900 pt-4 border-t border-zinc-200 mt-2">
                                    <span>Total Final</span>
                                    <span className="text-blue-700">
                                        ${(cartTotal + (deliveryMethod === "delivery" ? 1500 : 0)).toLocaleString("es-AR")}
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={cart.length === 0}
                                onClick={() => {
                                    localStorage.setItem("checkout_cart", JSON.stringify(cart));
                                    localStorage.setItem("checkout_delivery", deliveryMethod);
                                    router.push(`/store/${slug}/checkout`);
                                }}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30 active:scale-[0.98] uppercase tracking-wider"
                            >
                                Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="relative h-72 w-full bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selectedProduct.image || ""}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-full shadow-md backdrop-blur-md transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full uppercase tracking-widest">
                                        {selectedProduct.category}
                                    </span>
                                    <span className="text-3xl font-black text-slate-900">
                                        ${selectedProduct.price.toLocaleString("es-AR")}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">
                                    {selectedProduct.name}
                                </h2>
                                <p className="text-zinc-500 font-medium leading-relaxed">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 py-3.5 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={() => addToCart(selectedProduct)}
                                    className="flex-[2] py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Sumar al Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Mobile Cart Bar */}
            {(cart.length > 0 && !isCartVisible) && (
                <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <button
                        onClick={scrollToCart}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-2xl shadow-green-900/20 p-4 flex items-center justify-between transition-all active:scale-[0.98] border border-green-500"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 px-3 py-1.5 rounded-xl font-black">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'ítem' : 'ítems'}
                            </div>
                            <span className="font-bold text-lg">Ver Pedido</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-black text-xl tracking-tight">
                                ${(cartTotal).toLocaleString("es-AR")}
                            </span>
                            <div className="bg-white/20 p-2 rounded-xl hidden sm:block">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
