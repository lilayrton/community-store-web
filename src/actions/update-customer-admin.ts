"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCustomerAdmin(customerId: string, data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    assignedStore: string;
    isActive: boolean;
}) {
    try {
        await prisma.user.update({
            where: { id: customerId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                assignedStore: data.assignedStore,
                isActive: data.isActive
            }
        });

        revalidatePath(`/admin/customers/${customerId}`);
        revalidatePath('/admin/customers');
        return { success: true, message: "Cliente actualizado correctamente" };
    } catch (error) {
        console.error("Error updating customer:", error);
        return { success: false, message: "Error al actualizar el cliente" };
    }
}
