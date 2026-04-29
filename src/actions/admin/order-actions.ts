"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProductsForOrder(query: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                isArchived: false,
                name: {
                    contains: query,
                }
            },
            take: 20,
            orderBy: { name: 'asc' }
        });
        
        const plainProducts = products.map((p: any) => ({
            ...p,
            price: Number(p.price),
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
        }));

        return { success: true, products: plainProducts };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: "Error al buscar productos" };
    }
}

export async function updateOrderItemQuantity(orderId: string, itemId: string, newQuantity: number) {
    try {
        if (newQuantity < 1) {
            return { success: false, error: "La cantidad no puede ser menor a 1" };
        }

        let warning = null;

        await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.findUnique({
                where: { id: itemId },
                include: { product: true }
            });

            if (!item) throw new Error("Item no encontrado");

            const diff = newQuantity - item.quantity;

            if (diff !== 0 && item.product.isStockTracked) {
                const newStock = item.product.stock - diff;
                
                if (newStock < 0) {
                    warning = `Atención: El stock de ${item.product.name} quedó en negativo (${newStock}).`;
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: newStock }
                });

                await tx.stockLog.create({
                    data: {
                        productId: item.productId,
                        productName: item.product.name,
                        oldStock: item.product.stock,
                        newStock: newStock,
                        change: -diff,
                        referenceId: orderId,
                        username: "Admin (Edición Pedido)",
                    }
                });
            }

            await tx.orderItem.update({
                where: { id: itemId },
                data: { quantity: newQuantity }
            });

            // Recalculate total
            const allItems = await tx.orderItem.findMany({
                where: { orderId }
            });
            const newTotal = allItems.reduce((acc, curr) => acc + (curr.quantity * Number(curr.price)), 0);

            await tx.order.update({
                where: { id: orderId },
                data: { total: newTotal }
            });
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, warning };
    } catch (error: any) {
        console.error("Error updating quantity:", error);
        return { success: false, error: error.message || "Error al actualizar cantidad" };
    }
}

export async function removeOrderItem(orderId: string, itemId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.findUnique({
                where: { id: itemId },
                include: { product: true }
            });

            if (!item) throw new Error("Item no encontrado");

            if (item.product.isStockTracked) {
                const newStock = item.product.stock + item.quantity;
                
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: newStock }
                });

                await tx.stockLog.create({
                    data: {
                        productId: item.productId,
                        productName: item.product.name,
                        oldStock: item.product.stock,
                        newStock: newStock,
                        change: item.quantity,
                        referenceId: orderId,
                        username: "Admin (Eliminación Ítem)",
                    }
                });
            }

            await tx.orderItem.delete({
                where: { id: itemId }
            });

            // Recalculate total
            const allItems = await tx.orderItem.findMany({
                where: { orderId }
            });
            const newTotal = allItems.reduce((acc, curr) => acc + (curr.quantity * Number(curr.price)), 0);

            await tx.order.update({
                where: { id: orderId },
                data: { total: newTotal }
            });
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error removing item:", error);
        return { success: false, error: error.message || "Error al eliminar el producto" };
    }
}

export async function addOrderItemToOrder(orderId: string, productId: string, quantity: number) {
    try {
        if (quantity < 1) {
            return { success: false, error: "La cantidad no puede ser menor a 1" };
        }

        let warning = null;

        await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productId }
            });

            if (!product) throw new Error("Producto no encontrado");

            // Check if item already exists in order
            const existingItem = await tx.orderItem.findFirst({
                where: { orderId, productId }
            });

            if (existingItem) {
                throw new Error("El producto ya está en el pedido. Modifica su cantidad.");
            }

            if (product.isStockTracked) {
                const newStock = product.stock - quantity;
                
                if (newStock < 0) {
                    warning = `Atención: El stock de ${product.name} quedó en negativo (${newStock}).`;
                }

                await tx.product.update({
                    where: { id: productId },
                    data: { stock: newStock }
                });

                await tx.stockLog.create({
                    data: {
                        productId: product.id,
                        productName: product.name,
                        oldStock: product.stock,
                        newStock: newStock,
                        change: -quantity,
                        referenceId: orderId,
                        username: "Admin (Agregado Pedido)",
                    }
                });
            }

            await tx.orderItem.create({
                data: {
                    orderId,
                    productId,
                    quantity,
                    price: product.price
                }
            });

            // Recalculate total
            const allItems = await tx.orderItem.findMany({
                where: { orderId }
            });
            const newTotal = allItems.reduce((acc, curr) => acc + (curr.quantity * Number(curr.price)), 0);

            await tx.order.update({
                where: { id: orderId },
                data: { total: newTotal }
            });
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, warning };
    } catch (error: any) {
        console.error("Error adding item:", error);
        return { success: false, error: error.message || "Error al agregar el producto" };
    }
}
