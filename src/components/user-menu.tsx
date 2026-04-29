"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, ShoppingBag, ChevronDown } from "lucide-react";
import { logout } from "@/actions/auth";

interface UserMenuProps {
    user: {
        name: string | null;
        email: string;
        role: string;
    } | null;
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm md:text-base font-medium transition-colors shadow-sm"
            >
                Iniciar Sesión
            </Link>
        );
    }

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 sm:gap-3 p-1 sm:pl-2 sm:pr-4 sm:py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors shadow-sm"
            >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                        {user.name || "Usuario"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-none mt-1">
                        {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </p>
                </div>
                <ChevronDown className={`hidden sm:block w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                            {user.name || "Usuario"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    <div className="p-2">
                        {user.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-1"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Panel de Admin
                            </Link>
                        )}
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            Mi Información
                        </Link>
                        <Link
                            href="/orders"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Mis Pedidos
                        </Link>
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
