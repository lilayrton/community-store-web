import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_key_change_me_in_production"
);

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(session, JWT_SECRET, {
            algorithms: ['HS256'],
        });

        return {
            id: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string,
            name: payload.name as string | null
        };
    } catch (error) {
        return null;
    }
}
