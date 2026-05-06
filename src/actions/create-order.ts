"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function getCheckoutProfile() {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return null;

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, email: true, phone: true, address: true }
    });

    if (!user) return null;

    const nameParts = (user.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        isAdmin: user.role === 'ADMIN'
    };
}

type CartItem = {
    id: string;
    quantity: number;
    price: number;
};

type CustomerInfo = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    deliveryMethod: string;
    store: string;
    targetCycleId?: string;
};

export async function createOrder(cart: CartItem[], customer: CustomerInfo) {
    console.log("Creating order for:", customer.email);

    if (!cart || cart.length === 0) {
        return { success: false, error: "El carrito está vacío" };
    }

    const sessionUser = await getCurrentUser();
    const isAdmin = sessionUser?.role === 'ADMIN';

    try {
        // 1. Transaction to ensure integrity
        const result = await prisma.$transaction(async (tx) => {
            
            // Validate Cycle (Admin Override or Open Cycle)
            let cycleToLink = null;
            if (isAdmin && customer.targetCycleId) {
                cycleToLink = await tx.communityCycle.findUnique({
                    where: { id: customer.targetCycleId }
                });
                if (!cycleToLink) throw new Error("El ciclo seleccionado no existe.");
            } else {
                cycleToLink = await tx.communityCycle.findFirst({
                    where: { status: 'OPEN' }
                });
                if (!cycleToLink) {
                    throw new Error("La comunitaria se encuentra cerrada. No se pueden procesar nuevos pedidos en este momento.");
                }
            }

            // 2. Validate Products & Calculate Total
            let calculatedTotal = 0;
            const validItems = [];

            for (const item of cart) {
                const product = await tx.product.findUnique({
                    where: { id: item.id }
                });

                if (!product) throw new Error(`Producto no encontrado: ${item.id}`);

                // Check stock availability (Atomic check comes later during update, this is pre-validation)
                if (product.isStockTracked && product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}. Disponibles: ${product.stock}`);
                }

                calculatedTotal += Number(product.price) * item.quantity;
                validItems.push({ product, quantity: item.quantity, price: product.price });
            }

            // 3. Find or Create User
            let user = await tx.user.findUnique({
                where: { email: customer.email }
            });

            if (!user) {
                user = await tx.user.create({
                    data: {
                        email: customer.email,
                        name: `${customer.firstName} ${customer.lastName}`,
                        password: "GUEST_PASSWORD_HASH",
                        role: "CUSTOMER",
                        address: customer.address,
                        phone: customer.phone
                    }
                });
            } else {
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        address: customer.address,
                        phone: customer.phone,
                        name: `${customer.firstName} ${customer.lastName}`
                    }
                });
            }

            const finalTotal = customer.deliveryMethod === 'delivery' ? calculatedTotal + 1500 : calculatedTotal;

            // 4. Create Order
            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    total: finalTotal,
                    status: "PENDING",
                    cycleId: cycleToLink.id, // Link to validated cycle
                    store: customer.store, // Pass the store
                    items: {
                        create: validItems.map(item => ({
                            productId: item.product.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });

            // 5. Decrement Stock & Log (Now we have order.id)
            for (const item of validItems) {
                if (item.product.isStockTracked) {
                    // Atomic decrement
                    const updateResult = await tx.product.updateMany({
                        where: {
                            id: item.product.id,
                            stock: { gte: item.quantity }
                        },
                        data: {
                            stock: { decrement: item.quantity }
                        }
                    });

                    if (updateResult.count === 0) {
                        throw new Error(`Stock insuficiente para ${item.product.name} (cambió durante el proceso).`);
                    }

                    await tx.stockLog.create({
                        data: {
                            productId: item.product.id,
                            productName: item.product.name,
                            oldStock: item.product.stock,
                            newStock: item.product.stock - item.quantity,
                            change: -item.quantity,
                            username: `Sistema / Pedido`,
                            referenceId: order.id, // Linked!
                            createdAt: new Date()
                        }
                    });
                }
            }

            return order;
        });

        return { success: true, orderId: result.id };

    } catch (error: any) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message || "Error al procesar el pedido" };
    }
}
