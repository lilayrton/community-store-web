import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type StockLog = {
    id: string;
    productName: string;
    oldStock: number;
    newStock: number;
    change: number;
    referenceId?: string | null;
    username: string | null;
    createdAt: Date;
};

export default function StockHistoryList({ logs }: { logs: StockLog[] }) {
    if (logs.length === 0) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-zinc-500">
                <History size={18} />
                <h3 className="font-bold">Historial de Movimientos</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left relative">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 font-medium">Producto</th>
                            <th className="px-4 py-3 font-medium">Usuario / Referencia</th>
                            <th className="px-4 py-3 font-medium text-right">Cambio</th>
                            <th className="px-4 py-3 font-medium text-right">Stock Final</th>
                            <th className="px-4 py-3 font-medium text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                    {log.productName}
                                </td>
                                <td className="px-4 py-3 text-zinc-500">
                                    <div className="flex flex-col">
                                        <span>{log.username || 'Sistema'}</span>
                                        {log.referenceId && (
                                            log.referenceId.startsWith('DEL-') ? (
                                                <span className="text-xs text-zinc-400 mt-0.5 italic">
                                                    (Pedido Eliminado)
                                                </span>
                                            ) : (
                                                <a
                                                    href={`/admin/orders/${log.referenceId}`}
                                                    target="_blank"
                                                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                    Ver Pedido &rarr;
                                                </a>
                                            )
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${log.change > 0
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {log.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {log.change > 0 ? '+' : ''}{log.change}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                                    {log.newStock}
                                </td>
                                <td className="px-4 py-3 text-right text-zinc-400">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
