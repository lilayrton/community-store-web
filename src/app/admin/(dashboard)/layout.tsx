'use client';

import Sidebar from '../Sidebar';
import { useState, useEffect } from 'react';
import { Menu, X, Store } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on path change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [sidebarOpen]);

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-indigo-50/30 dark:bg-black">
            
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-blue-700 dark:bg-zinc-900 text-white z-30 sticky top-0 shadow-md">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Store className="w-6 h-6" />
                    <span>ComunitariasCaba</span>
                </div>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 -mr-2 rounded-lg hover:bg-black/10 transition-colors"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full'} md:w-auto h-screen shadow-2xl md:shadow-none`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-zinc-50 dark:bg-black overflow-x-hidden pt-4 md:pt-0">
                {children}
            </main>
        </div>
    );
}
