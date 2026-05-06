"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStore(orderId: string, newStore: string) {
    if (!orderId || !newStore) {
        return { success: false, error: "Faltan datos obligatorios" };
    }

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { store: newStore },
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Error updating order store:", error);
        return { success: false, error: "Error al actualizar la tienda del pedido" };
    }
}
