import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CustomersPage() {

    // Fetch customers (users with role CUSTOMER)
    const customers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
            _count: {
                select: { orders: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8">
            <PageHeader
                title="Clientes"
                actionLabel="Nuevo Cliente"
                actionHref="/admin/customers/new"
            />

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Fecha Reg.</th>
                            <th className="px-6 py-4">Pedidos</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    No hay clientes registrados.
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer: any) => (
                                <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                        {customer.name || "Sin Nombre"}
                                    </td>
                                    <td className="px-6 py-4">{customer.email}</td>
                                    <td className="px-6 py-4">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer._count.orders}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Profile edit page not implemented yet, linking to # */}
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium text-sm"
                                        >
                                            Ver Perfil
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
