"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Fetch Order with Items
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { product: true } } }
            });

            if (!order) {
                throw new Error("Pedido no encontrado.");
            }

            // 2. Restore Stock for Tracked Items
            for (const item of order.items) {
                if (item.product && item.product.isStockTracked) {
                    const newStock = item.product.stock + item.quantity;

                    // Increment Stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: newStock }
                    });

                    // Log Restoration
                    await tx.stockLog.create({
                        data: {
                            productId: item.productId,
                            productName: item.product.name,
                            oldStock: item.product.stock,
                            newStock: newStock,
                            change: item.quantity, // Positive change (restoration)
                            username: "Admin / Eliminación",
                            referenceId: `DEL-${order.id.slice(0, 8)}`, // Custom ref to indicate deletion
                            createdAt: new Date()
                        }
                    });
                }
            }

            // 3. Delete Order Items (Prevent FK Error)
            await tx.orderItem.deleteMany({
                where: { orderId: orderId }
            });

            // 4. Delete Order
            await tx.order.delete({
                where: { id: orderId }
            });
        });

        revalidatePath("/admin");
        revalidatePath("/admin/orders");
        revalidatePath("/admin/inventory"); // Update inventory view too

        return { success: true, message: "Pedido eliminado y stock restaurado correctamente." };
    } catch (error) {
        console.error("Error deleting order:", error);
        return { success: false, message: "Error al eliminar el pedido." };
    }
}
