'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleCustomerStatus(id: string, isActive: boolean) {
    if (!id) {
        return { success: false, message: "ID is required" };
    }

    try {
        await prisma.user.update({
            where: { id },
            data: { isActive }
        });

        revalidatePath(`/admin/customers/${id}`);
        revalidatePath('/admin/customers');

        return { success: true, message: isActive ? "Usuario habilitado" : "Usuario deshabilitado" };
    } catch (error) {
        console.error("Error toggling customer status:", error);
        return { success: false, message: "Error al actualizar el estado" };
    }
}
