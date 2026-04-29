'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";

export async function updateCustomer(formData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    confirmPassword?: string;
}) {
    const { id, firstName, lastName, email, phone, address, password, confirmPassword } = formData;

    // Basic validation
    if (!id || !email) {
        return { success: false, message: "ID y Email son requeridos" };
    }

    if (password && password !== confirmPassword) {
        return { success: false, message: "Las contraseñas no coinciden" };
    }

    try {
        const updateData: any = {
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            address,
        };

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        revalidatePath(`/admin/customers/${id}`);
        revalidatePath('/admin/customers');

        return { success: true, message: "Perfil actualizado correctamente" };
    } catch (error) {
        console.error("Error updating customer:", error);
        return { success: false, message: "Error al actualizar el perfil" };
    }
}
