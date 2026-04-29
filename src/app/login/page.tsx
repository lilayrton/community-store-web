"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";

export default function CustomerLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formDataState, setFormDataState] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormDataState({
            ...formDataState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", formDataState.email);
        formData.append("password", formDataState.password);

        const result = await login(formData);

        if (result.success) {
            router.push("/");
        } else {
            alert(result.error); // Simple alert for now, could be better UI
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex font-sans">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-blue-600">
                <div className="relative z-10 text-center p-12">
                    <div className="inline-flex items-center justify-center rounded-full bg-white/20 p-6 mb-8">
                        <ShoppingBag className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                        Tu mercadería,<br />
                        a un clic de distancia.
                    </h1>
                    <p className="text-white/90 text-xl max-w-md mx-auto font-medium leading-relaxed">
                        Accedé al portal mayorista exclusivo para kiosqueros y realizá tus pedidos de forma simple.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white z-10">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-6">
                            <ShoppingBag className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            ¡Hola de nuevo!
                        </h2>
                        <p className="text-slate-500 font-medium text-lg">
                            Ingresá tus credenciales para continuar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formDataState.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                        Contraseña
                                    </label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formDataState.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Ingresar al Sistema
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
