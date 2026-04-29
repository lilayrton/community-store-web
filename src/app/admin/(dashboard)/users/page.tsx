import { prisma } from "@/lib/prisma";
import { User, Shield, UserPlus } from "lucide-react";
import CreateAdminForm from "./CreateAdminForm";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Gestión de Administradores
                    </h1>
                    <p className="text-zinc-500 mt-2">
                        Controla quién tiene acceso al panel administrativo.
                    </p>
                </div>
                <CreateAdminForm />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="p-4 font-medium text-zinc-500 text-sm">Usuario</th>
                            <th className="p-4 font-medium text-zinc-500 text-sm">Nombre</th>
                            <th className="p-4 font-medium text-zinc-500 text-sm">Email</th>
                            <th className="p-4 font-medium text-zinc-500 text-sm">Fecha Registro</th>
                            <th className="p-4 font-medium text-zinc-500 text-sm">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {admin.username || 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-600 dark:text-zinc-300">{admin.name}</td>
                                <td className="p-4 text-zinc-500">{admin.email || '-'}</td>
                                <td className="p-4 text-zinc-500">
                                    {new Date(admin.createdAt).toLocaleDateString('es-AR')}
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Activo
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
