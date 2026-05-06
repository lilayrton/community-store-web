"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Loader2, CheckCircle, Home, Store, Truck, Info, ShieldAlert } from "lucide-react";
import { createOrder, getCheckoutProfile } from "@/actions/create-order";
import { getActiveCycle, getPastCycles } from "@/actions/admin/cycle-actions";

// --- Types ---
type CartItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
};

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    // --- State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeCycle, setActiveCycle] = useState<any>(null);
    const [pastCycles, setPastCycles] = useState<any[]>([]);
    const [targetCycleId, setTargetCycleId] = useState<string>("");

    // Empty initial state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        note: ""
    });

    useEffect(() => {
        setIsMounted(true);
        // Load cart and delivery method from storage
        const savedCart = localStorage.getItem("checkout_cart");
        const savedDelivery = localStorage.getItem("checkout_delivery");

        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            // If no cart, redirect back to store
            if (!isSuccess) {
                router.push(`/store/${slug}`);
            }
        }

        if (savedDelivery) {
            setDeliveryMethod(savedDelivery);
        }

        // Cargar ciclos
        Promise.all([
            getActiveCycle(),
            getPastCycles(5),
            getCheckoutProfile()
        ]).then(([active, past, profile]) => {
            setActiveCycle(active);
            setPastCycles(past);
            
            if (profile) {
                setIsAdmin(profile.isAdmin);
                setFormData(prev => ({
                    ...prev,
                    firstName: profile.firstName || prev.firstName,
                    lastName: profile.lastName || prev.lastName,
                    email: profile.email || prev.email,
                    phone: profile.phone || prev.phone,
                    address: profile.address || prev.address
                }));
            }
        });
    }, [slug, router, isSuccess]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const deliveryCost = useMemo(() => {
        return deliveryMethod === "delivery" ? 1500 : 0;
    }, [deliveryMethod]);

    const finalTotal = cartTotal + deliveryCost;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createOrder(cart, {
            ...formData,
            deliveryMethod,
            store: slug,
            targetCycleId: isAdmin && targetCycleId ? targetCycleId : undefined
        });

        if (result.success) {
            // Clear cart
            localStorage.removeItem("checkout_cart");
            localStorage.removeItem("checkout_delivery");
            setCart([]);
            setIsSuccess(true);
        } else {
            alert("Hubo un error al crear el pedido: " + result.error);
        }

        setIsLoading(false);
    };

    if (!isMounted) return null;

    if (!activeCycle && !isAdmin && !isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] font-sans p-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-200 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Store className="w-12 h-12" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-3">
                        Comunitaria Cerrada
                    </h1>
                    <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                        En este momento no estamos recibiendo nuevos pedidos. ¡Pronto abriremos una nueva comunitaria!
                    </p>

                    <button
                        onClick={() => router.push(`/store/${slug}`)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] font-sans p-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-200 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-12 h-12" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-3">
                        ¡Pedido Confirmado!
                    </h1>
                    <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                        Gracias <strong>{formData.firstName}</strong>. Hemos recibido tu pedido correctamente. Te enviamos los detalles a <strong>{formData.email}</strong>.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-md"
                        >
                            <Home className="w-5 h-5" />
                            Volver al Inicio
                        </button>
                        <button
                            onClick={() => router.push(`/store/${slug}`)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-100 border border-blue-200 transition-colors shadow-sm"
                        >
                            <Store className="w-5 h-5" />
                            Hacer otro pedido
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans p-4 md:p-8 text-zinc-900">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors text-lg"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Volver a la tienda
                </button>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Finalizar Pedido</h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* --- Checkout Form --- */}
                    <div className="lg:col-span-3 space-y-6">
                        <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200 space-y-8">

                            {/* Instrucciones */}
                            {isAdmin && !activeCycle ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                                        <ShieldAlert className="w-6 h-6 text-red-700" />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="font-bold text-red-900 text-lg">Modo Administrador Activo</h3>
                                        <p className="text-red-800 mt-1 font-medium leading-relaxed mb-3">
                                            La comunitaria está CERRADA para el público, pero podés agregar este pedido internamente. Seleccioná a qué ciclo querés asignarlo:
                                        </p>
                                        <select 
                                            value={targetCycleId}
                                            onChange={(e) => setTargetCycleId(e.target.value)}
                                            className="w-full bg-white border border-red-200 text-red-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                                        >
                                            <option value="">Seleccionar ciclo (obligatorio)</option>
                                            {pastCycles.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} (Cerrado)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : isAdmin && activeCycle ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                                    <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                                        <ShieldAlert className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="font-bold text-yellow-900 text-lg">Modo Administrador Activo</h3>
                                        <p className="text-yellow-800 mt-1 font-medium leading-relaxed mb-3">
                                            Podés asignar este pedido al ciclo actual ({activeCycle.name}) o a uno anterior:
                                        </p>
                                        <select 
                                            value={targetCycleId}
                                            onChange={(e) => setTargetCycleId(e.target.value)}
                                            className="w-full bg-white border border-yellow-200 text-yellow-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5"
                                        >
                                            <option value="">Ciclo Actual ({activeCycle.name})</option>
                                            {pastCycles.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} (Cerrado)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                        <Info className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg">Último paso</h3>
                                        <p className="text-blue-800 mt-1 font-medium leading-relaxed">
                                            Completá tus datos para que podamos preparar tu pedido. Revisa que tu teléfono esté correcto para poder contactarte.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                    Tus Datos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-base font-bold text-zinc-700">Nombre</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-base font-bold text-zinc-700">Apellido</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-base font-bold text-zinc-700">Teléfono (Celular)</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-base font-bold text-zinc-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-zinc-200" />

                            {/* Delivery Info */}
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                    Entrega
                                </h2>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${deliveryMethod === 'pickup'
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md'
                                            : 'border-zinc-200 hover:border-zinc-300 text-zinc-500 bg-zinc-50 hover:bg-zinc-100'
                                            }`}
                                    >
                                        <Store className={`w-8 h-8 sm:w-10 sm:h-10 ${deliveryMethod === 'pickup' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                        <div className="text-center">
                                            <span className="block font-black text-lg sm:text-xl">Retiro</span>
                                            <span className="text-sm font-medium mt-1">En local</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${deliveryMethod === 'delivery'
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md'
                                            : 'border-zinc-200 hover:border-zinc-300 text-zinc-500 bg-zinc-50 hover:bg-zinc-100'
                                            }`}
                                    >
                                        <Truck className={`w-8 h-8 sm:w-10 sm:h-10 ${deliveryMethod === 'delivery' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                        <div className="text-center">
                                            <span className="block font-black text-lg sm:text-xl">Delivery</span>
                                            <span className="text-sm font-medium mt-1">A domicilio</span>
                                        </div>
                                    </button>
                                </div>

                                {deliveryMethod === 'delivery' ? (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                                        <div className="space-y-2">
                                            <label className="text-base font-bold text-zinc-700">Dirección Completa de Envío</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3.5 w-6 h-6 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Ej. San Martín 456, Piso 2 Depto B"
                                                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium text-slate-900 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-base font-bold text-zinc-700">Nota para el repartidor (Opcional)</label>
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="Ej. El timbre no funciona, golpear fuerte la puerta..."
                                                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all text-lg font-medium text-slate-900 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-200 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                        <MapPin className="w-8 h-8 text-green-600 shrink-0" />
                                        <div>
                                            <p className="font-black text-green-900 text-lg">Retirás por {slug === 'alsina' ? 'Sucursal Alsina' : 'Sucursal Malabia'}</p>
                                            <p className="text-base font-medium text-green-800 mt-2">
                                                ¡Te avisaremos cuando tu pedido esté listo para retirar! Recordá llevar tu DNI.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>

                    {/* --- Order Summary (Sticky) --- */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-zinc-200 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                                    Tu Pedido
                                </h2>
                            </div>

                            <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-start gap-3">
                                        <div className="flex gap-3 items-start">
                                            <span className="font-bold text-slate-900 bg-zinc-100 px-2 py-0.5 rounded-md text-sm border border-zinc-200">
                                                {item.quantity}x
                                            </span>
                                            <span className="font-bold text-slate-700 leading-tight">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-black text-slate-900">
                                            ${(item.price * item.quantity).toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-4">
                                <div className="space-y-2 text-base font-medium text-zinc-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toLocaleString("es-AR")}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-800">
                                        <span>Envío ({deliveryMethod === 'delivery' ? 'Domicilio' : 'Retiro'})</span>
                                        <span>{deliveryCost > 0 ? `$${deliveryCost.toLocaleString("es-AR")}` : 'Gratis'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-300">
                                    <div className="flex justify-between items-end mb-6">
                                        <span className="text-lg font-bold text-slate-900">Total a Pagar</span>
                                        <span className="text-3xl font-black text-green-700">
                                            ${finalTotal.toLocaleString("es-AR")}
                                        </span>
                                    </div>

                                    <button
                                        form="checkout-form"
                                        type="submit"
                                        disabled={isLoading || (isAdmin && !activeCycle && !targetCycleId)}
                                        className="w-full py-3.5 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-lg lg:text-base xl:text-lg shadow-lg shadow-green-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 shrink-0" />
                                                <span className="whitespace-nowrap">Confirmar Compra</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-sm font-medium text-zinc-500 mt-4">
                                        Pago seguro al recibir tu pedido.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
