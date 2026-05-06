"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function openCycle(name: string) {
    if (!name) {
        return { success: false, error: "El nombre es obligatorio" };
    }

    try {
        // 1. Close all currently open cycles to ensure only one is open
        await prisma.communityCycle.updateMany({
            where: { status: "OPEN" },
            data: { 
                status: "CLOSED",
                endDate: new Date()
            }
        });

        // 2. Create the new cycle
        const newCycle = await prisma.communityCycle.create({
            data: {
                name,
                startDate: new Date(),
                status: "OPEN"
            }
        });

        revalidatePath("/admin");
        revalidatePath("/shop");
        return { success: true, cycle: newCycle };
    } catch (error) {
        console.error("Error opening cycle:", error);
        return { success: false, error: "Error al abrir la comunitaria" };
    }
}

export async function closeCycle(id: string) {
    try {
        await prisma.communityCycle.update({
            where: { id },
            data: { 
                status: "CLOSED",
                endDate: new Date()
            }
        });

        revalidatePath("/admin");
        revalidatePath("/shop");
        return { success: true };
    } catch (error) {
        console.error("Error closing cycle:", error);
        return { success: false, error: "Error al cerrar la comunitaria" };
    }
}

export async function getActiveCycle() {
    try {
        return await prisma.communityCycle.findFirst({
            where: { status: "OPEN" },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching active cycle:", error);
        return null;
    }
}

export async function getPastCycles(take = 10) {
    try {
        return await prisma.communityCycle.findMany({
            where: { status: "CLOSED" },
            orderBy: { createdAt: "desc" },
            take
        });
    } catch (error) {
        console.error("Error fetching past cycles:", error);
        return [];
    }
}
