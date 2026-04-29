"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_key_change_me_in_production"
);

export async function createAdminUser(data: FormData) {
    // 1. Security Check: Ensure caller is an Admin
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
        return { success: false, error: "No autorizado" };
    }

    try {
        const { payload } = await jwtVerify(session, JWT_SECRET);
        if (payload.role !== 'ADMIN') {
            return { success: false, error: "No tienes permisos de administrador" };
        }
    } catch (e) {
        return { success: false, error: "Sesión inválida" };
    }

    // 2. Extract Data
    const name = data.get("name") as string;
    const username = data.get("username") as string;
    const email = data.get("email") as string; // Optional for admin? User requested username mostly.
    const password = data.get("password") as string;

    if (!name || !username || !password) {
        return { success: false, error: "Faltan datos obligatorios (Nombre, Usuario, Contraseña)" };
    }

    try {
        // 3. Check duplicates
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || undefined } // Check email only if provided
                ]
            }
        });

        if (existingUser) {
            return { success: false, error: "El usuario o email ya existe" };
        }

        // 4. Create Admin
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                username,
                email: email || null,
                password: hashedPassword,
                role: "ADMIN"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating admin:", error);
        return { success: false, error: "Error interno al crear administrador" };
    }
}
