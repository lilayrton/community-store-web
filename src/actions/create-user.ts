"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser(data: FormData) {
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    // const address = data.get("address") as string;
    // const phone = data.get("phone") as string;

    if (!name || !email || !password) {
        return { success: false, error: "Faltan datos obligatorios" };
    }

    try {
        // Check if user exists (by email) ... maybe also check by username if we let them pick one?
        // For now, let's auto-generate username from email or let them pick?
        // The Prompt implies we are just changing Admin login. But for consistency, let's assume
        // we might want usernames for customers too.
        // For now, let's keep email as the primary 'customer' login, but generate a username from it
        // so the model is satisfied.
        const username = email.split('@')[0];

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return { success: false, error: "El email o usuario ya está registrado" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                username, // Save generated username
                password: hashedPassword,
                role: "CUSTOMER",
            }
        });

        return { success: true };

    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Error al crear el usuario" };
    }
}
