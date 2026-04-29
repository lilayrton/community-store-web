"use client";

import { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formDataState, setFormDataState] = useState({
        username: "",
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
        setError(null);

        const formData = new FormData();
        formData.append("username", formDataState.username);
        formData.append("password", formDataState.password);

        const result = await login(formData);

        if (result.success) {
            router.push("/admin");
        } else {
            setError(result.error || "Error al iniciar sesión");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Acceso Administrativo
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Sistema de Gestión
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formDataState.username} // Keeping state property 'email' for simplicity or rename it? Rename is better.
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Usuario"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formDataState.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-zinc-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 bg-white text-black rounded-lg font-medium text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Ingresar al Panel
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
