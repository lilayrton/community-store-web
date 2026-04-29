import PageHeader from "@/components/admin/PageHeader";

export default function PaymentsPage() {
    return (
        <div className="p-8">
            <PageHeader
                title="Pagos"
            />

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">ID Transacción</th>
                            <th className="px-6 py-4">Pedido</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">TXN-998877</td>
                            <td className="px-6 py-4">#1001</td>
                            <td className="px-6 py-4">$45.50</td>
                            <td className="px-6 py-4">Tarjeta Crédito</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Completado
                                </span>
                            </td>
                        </tr>
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">TXN-998878</td>
                            <td className="px-6 py-4">#1002</td>
                            <td className="px-6 py-4">$22.00</td>
                            <td className="px-6 py-4">Efectivo</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Completado
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
