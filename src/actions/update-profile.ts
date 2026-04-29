'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function updateProfile(formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    confirmPassword?: string;
}) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: "No autorizado" };
    }

    const { firstName, lastName, email, phone, address, password, confirmPassword } = formData;

    // Basic validation
    if (!email) {
        return { success: false, message: "Email es requerido" };
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
            where: { id: user.id },
            data: updateData
        });

        revalidatePath('/profile');

        return { success: true, message: "Perfil actualizado correctamente" };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Error al actualizar el perfil" };
    }
}
