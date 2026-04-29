'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrder } from '@/actions/delete-order';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function DeleteOrderButton({ orderId, redirectTo }: { orderId: string, redirectTo?: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteOrder(orderId);

        if (!result.success) {
            alert(result.message);
            setIsDeleting(false);
        } else {
            setShowConfirm(false);
            if (redirectTo) {
                router.push(redirectTo);
            }
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-1 rounded-lg border border-red-100 dark:border-red-900/30">
                <span className="text-xs text-red-600 font-bold flex items-center gap-1 pl-1">
                    <AlertTriangle size={12} />
                    ¿Seguro?
                </span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Sí, borrar'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
                >
                    Cancelar
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className={`flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ${redirectTo ? 'bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 shadow-sm' : ''}`}
            title="Eliminar Pedido"
        >
            <Trash2 size={18} />
            {redirectTo && <span className="text-sm font-medium">Eliminar Pedido</span>}
        </button>
    );
}
