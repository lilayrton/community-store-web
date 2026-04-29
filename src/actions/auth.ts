"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_key_change_me_in_production"
);

export async function login(formData: FormData) {
    const identifier = formData.get("username") as string || formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
        return { success: false, error: "Usuario/Email y contraseña requeridos" };
    }

    try {
        // 1. Find user by email OR username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!user) {
            return { success: false, error: "Credenciales inválidas" };
        }

        // 2. Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return { success: false, error: "Credenciales inválidas" };
        }

        // 3. Generate Session Token (JWT)
        const token = await new SignJWT({
            userId: user.id,
            email: user.email || user.username || 'unknown',
            role: user.role,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h') // Session lasts 24 hours
            .sign(JWT_SECRET);

        // 4. Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        return { success: true };

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Error interno al iniciar sesión" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
