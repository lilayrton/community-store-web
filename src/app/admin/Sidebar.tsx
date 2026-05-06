'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logout } from '@/actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    LayoutDashboard,
    Store,
    MapPin,
    UtensilsCrossed,
    Tags,
    ShoppingBag,
    ClipboardList,
    Activity,
    CreditCard,
    Settings,
    Users,
    User,
    ChevronDown,
    LogOut,
    PackageOpen,
    Box
} from 'lucide-react';

export default function Sidebar() {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isSalesOpen, setIsSalesOpen] = useState(false);
    const [isSystemOpen, setIsSystemOpen] = useState(false);

    return (
        <aside className="w-72 bg-blue-700 dark:bg-zinc-900 text-white p-6 h-screen overflow-y-auto transition-colors duration-300">
            <div className="mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Store className="h-8 w-8" />
                    ComunitariasCaba
                </h2>
            </div>
            <nav className="flex flex-col gap-2">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-3"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                {/* Tienda Dropdown */}
                <div>
                    <button
                        onClick={() => setIsStoreOpen(!isStoreOpen)}
                        className="w-full text-left p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <Store size={20} />
                            <span>Tienda</span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${isStoreOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isStoreOpen && (
                        <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-blue-500 dark:border-zinc-700 pl-2">
                            <Link
                                href="/admin/products/setup"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2 group"
                            >
                                <span className="bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 text-xs font-bold px-1.5 py-0.5 rounded">
                                    Nuevo
                                </span>
                                <div>
                                    <span className="block font-medium">Editor de Catálogo</span>
                                    <span className="text-[10px] text-zinc-400 group-hover:text-blue-200 block -mt-0.5">Armar catálogo</span>
                                </div>
                            </Link>
                            <Link
                                href="/admin/locations"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <MapPin size={16} />
                                Ubicaciones
                            </Link>
                            <Link
                                href="/admin/products"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <Box size={16} />
                                Productos
                            </Link>
                            <Link
                                href="/admin/categories"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <Tags size={16} />
                                Categorías
                            </Link>
                            <Link
                                href="/admin/inventory"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <PackageOpen size={16} />
                                Gestión Quintero
                            </Link>
                        </div>
                    )}
                </div>

                {/* Ventas Dropdown */}
                <div>
                    <button
                        onClick={() => setIsSalesOpen(!isSalesOpen)}
                        className="w-full text-left p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={20} />
                            <span>Ventas</span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${isSalesOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isSalesOpen && (
                        <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-blue-500 dark:border-zinc-700 pl-2">
                            <Link
                                href="/admin/orders"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <ClipboardList size={16} />
                                Pedidos
                            </Link>
                            <Link
                                href="/admin/order-statuses"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <Activity size={16} />
                                Estados
                            </Link>
                            <Link
                                href="/admin/payments"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <CreditCard size={16} />
                                Pagos
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sistema Dropdown */}
                <div>
                    <button
                        onClick={() => setIsSystemOpen(!isSystemOpen)}
                        className="w-full text-left p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={20} />
                            <span>Sistema</span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${isSystemOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isSystemOpen && (
                        <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-blue-500 dark:border-zinc-700 pl-2">
                            <Link
                                href="/admin/settings"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <Settings size={16} />
                                Configuración
                            </Link>
                            <Link
                                href="/admin/users"
                                className="p-2 text-sm text-blue-100 dark:text-zinc-300 hover:text-white hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                            >
                                <Users size={16} />
                                Usuarios
                            </Link>
                        </div>
                    )}
                </div>

                {/* Links simples finales */}
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-3"
                >
                    <User size={20} />
                    Clientes
                </Link>

                <div className="mt-8 pt-8 border-t border-blue-600 dark:border-zinc-800 space-y-2">
                    <ThemeToggle />
                    <button
                        onClick={async () => {
                            await logout().then(() => {
                                window.location.href = '/login';
                            });
                        }}
                        className="w-full text-left p-2 text-blue-100 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors flex items-center gap-3 group"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
