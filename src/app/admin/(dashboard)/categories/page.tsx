import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";

export default function CategoriesPage() {
    return (
        <div className="p-8">
            <PageHeader
                title="Categorías"
                actionLabel="+ Nueva Categoría"
                actionHref="/admin/categories/new"
            />

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Productos</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Hamburguesas</td>
                            <td className="px-6 py-4">hamburguesas</td>
                            <td className="px-6 py-4">8</td>
                            <td className="px-6 py-4 text-right">
                                <Link href="/admin/categories/1" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Editar</Link>
                            </td>
                        </tr>
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Bebidas</td>
                            <td className="px-6 py-4">bebidas</td>
                            <td className="px-6 py-4">12</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Editar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
