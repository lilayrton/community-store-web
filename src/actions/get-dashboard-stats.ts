"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentCommunityRange } from "@/lib/community-cycle";

export async function getDashboardStats(store?: string) {
    try {
        const where: any = store ? { store } : {};

        // 1. Basic Counts
        const totalOrders = await prisma.order.count({
            where,
        });

        // 2. Sales Aggregation
        const salesAggregate = await prisma.order.aggregate({
            _sum: {
                total: true,
            },
            where,
        });
        const totalSales = salesAggregate._sum && salesAggregate._sum.total ? Number(salesAggregate._sum.total) : 0;

        // 3. Top Customers
        const groupedOrders = await prisma.order.groupBy({
            by: ['userId'],
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...where,
                userId: { not: null }
            },
            orderBy: {
                _sum: {
                    total: 'desc',
                }
            },
            take: 10,
        });

        const userIds = groupedOrders.map(g => g.userId).filter(id => id !== null) as string[];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
        });

        const topCustomers = groupedOrders.map(group => {
            const user = users.find(u => u.id === group.userId);
            return {
                id: group.userId as string,
                name: user?.name || user?.email || "Usuario Desconocido",
                totalOrders: group._count.id,
                totalSpent: group._sum.total ? Number(group._sum.total) : 0,
                lastOrderDate: new Date().toISOString()
            };
        });

        // 4. Inactive Customers (Sin Comprar)
        const currentRange = getCurrentCommunityRange();

        const userWhere: any = {
            isActive: true,
            role: { not: 'ADMIN' }
        };
        if (store) {
            userWhere.assignedStore = store;
        }

        const activeUsers = await prisma.user.findMany({
            where: userWhere,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true
            }
        });

        const buyingUsers = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: currentRange.start,
                    lte: currentRange.end
                },
                userId: { in: activeUsers.map(u => u.id) }
            },
            select: {
                userId: true
            },
            distinct: ['userId']
        });

        const buyingUserIds = new Set(buyingUsers.map(o => o.userId));

        const inactiveCustomers = activeUsers
            .filter(user => !buyingUserIds.has(user.id))
            .map(user => ({
                id: user.id,
                name: user.name || user.email || "Sin Nombre",
                phone: user.phone || "-"
            }));

        // 5. Duplicate Orders
        const rangeWhere = {
            createdAt: {
                gte: currentRange.start,
                lte: currentRange.end
            },
            ...where
        };

        const potentialDuplicates = await prisma.order.groupBy({
            by: ['userId'],
            where: {
                ...rangeWhere,
                userId: { not: null }
            },
            _count: {
                id: true
            },
            having: {
                id: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        let duplicateOrders: any[] = [];
        if (potentialDuplicates.length > 0) {
            const dupUserIds = potentialDuplicates.map(d => d.userId) as string[];

            const dupOrders = await prisma.order.findMany({
                where: {
                    userId: { in: dupUserIds },
                    createdAt: {
                        gte: currentRange.start,
                        lte: currentRange.end
                    }
                },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            duplicateOrders = dupOrders.map(order => ({
                id: order.id,
                customerName: order.user?.name || order.user?.email || "Sin Nombre",
                value: Number(order.total),
                time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            duplicateOrders = dupOrders.map(order => ({
                id: order.id,
                customerName: order.user?.name || order.user?.email || "Sin Nombre",
                value: Number(order.total),
                time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
        }

        // 7. Average Ticket
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        // 8. Stagnant Products (Estancados)
        // Products that have 0 sales in the current cycle for the filtered store (or all stores if no filter)
        // If we filter by store, we should only check orders in THAT store.
        // But Products are global? If a product didn't sell in Alsina, it might have sold in Malabia.
        // If 'store' is selected, we want products that didn't sell IN THAT store.

        // Find all products
        const allProducts = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                category: true
            }
        });

        // Find products sold in current range (and store)
        const salesRangeWhere = {
            createdAt: {
                gte: currentRange.start,
                lte: currentRange.end
            },
            ...where
        };

        const soldProductIds = await prisma.orderItem.findMany({
            where: {
                order: salesRangeWhere
            },
            select: {
                productId: true
            },
            distinct: ['productId']
        });

        const soldSet = new Set(soldProductIds.map(i => i.productId));

        const stagnantProducts = allProducts
            .filter(p => !soldSet.has(p.id))
            .map(p => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                categoryName: p.category
            }))
            .slice(0, 10); // Limit to 10 for display

        // 9. Potential Customers (Nuevos Clientes - Primera Compra en este ciclo)
        // Logic: Users who have an order in current range, and that is their FIRST and ONLY order.
        // Actually, if they made 2 orders this week and 0 before, are they "Potential"?
        // User definition: "realizaron su pedido numero 1".
        // Let's count users who have strictly 1 order lifetime, and that order is in current salesRange.
        // OR: Users whose `min(createdAt)` order is in current range.

        // Strategy: Get all users who ordered in this cycle.
        // For each, check if their total order count is 1. (Strict "One-time buyer acquired now")
        // If they bought 2 times this week (and 0 before), they are also "New" but "High value".
        // "pedido numero 1" implies the event of the first order happened now.

        // Let's fetch all orders in current range.
        // Then check if for that user, it was their first order.
        const usersOrderingInCycle = await prisma.user.findMany({
            where: {
                orders: {
                    some: salesRangeWhere // Reuse the store+date filter
                }
            },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        // Filter: Total orders should be 1? 
        // Or should we check if their *first* order is in this range?
        // If I buy for the first time on Monday, and again on Tuesday.
        // On Wednesday, am I a "Potential Customer"?
        // I "realicé mi pedido número 1". Yes.
        // So I should count users whose `firstOrderDate` >= currentRange.start.

        // To be precise and performant:
        // Find users who ordered in this range.
        // Check if they have ANY order before currentRange.start.
        // If NO orders before start, then they are "New Customers".

        const newCustomerIds: string[] = [];
        for (const user of usersOrderingInCycle) {
            const previousOrdersCount = await prisma.order.count({
                where: {
                    userId: user.id,
                    createdAt: {
                        lt: currentRange.start
                    }
                }
            });
            if (previousOrdersCount === 0) {
                newCustomerIds.push(user.id);
            }
        }

        const newCustomersRaw = await prisma.user.findMany({
            where: { id: { in: newCustomerIds } },
            select: { id: true, name: true, email: true, phone: true, createdAt: true }
        });

        const newCustomers = newCustomersRaw.map(u => ({
            id: u.id,
            name: u.name || "Sin nombre",
            email: u.email,
            phone: u.phone
        }));

        // 10. Cycle End Time
        const cycleEndTime = currentRange.end.toISOString();

        // 11. Top Selling Products (Top 10)
        const topProductGroup = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: salesRangeWhere
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 10
        });

        // 12. Total Units Sold (Unidades Vendidas)
        // Aggregation for total quantity of items sold in this cycle/store
        const totalUnitsGroup = await prisma.orderItem.aggregate({
            _sum: {
                quantity: true
            },
            where: {
                order: salesRangeWhere
            }
        });
        const totalUnits = totalUnitsGroup._sum.quantity || 0;

        const topProducts = [];
        if (topProductGroup.length > 0) {
            const productIds = topProductGroup.map(g => g.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true }
            });

            // Map results maintaining order from groupBy
            for (const group of topProductGroup) {
                const product = products.find(p => p.id === group.productId);
                if (product) {
                    topProducts.push({
                        id: product.id,
                        name: product.name,
                        count: group._sum.quantity || 0
                    });
                }
            }
        }

        // --- NEW CHARTS DATA ---
        
        // C1. Ventas por Categoría
        const orderItemsWithProducts = await prisma.orderItem.findMany({
            where: { order: salesRangeWhere },
            select: { quantity: true, product: { select: { category: true } } }
        });
        
        const categorySum: Record<string, number> = {};
        for (const item of orderItemsWithProducts) {
             const cat = item.product.category || 'Otros';
             categorySum[cat] = (categorySum[cat] || 0) + item.quantity;
        }
        const salesByCategory = Object.entries(categorySum)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value);

        // C2. Pedidos por Hora
        const ordersForHours = await prisma.order.findMany({
            where: { ...salesRangeWhere },
            select: { createdAt: true }
        });
        
        const hoursSum: Record<string, number> = {};
        for (const order of ordersForHours) {
            const hour = new Date(order.createdAt).getHours();
            const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
            hoursSum[hourLabel] = (hoursSum[hourLabel] || 0) + 1;
        }
        
        const minHour = Math.min(...Object.keys(hoursSum).map(h => parseInt(h.split(':')[0])), 8);
        const maxHour = Math.max(...Object.keys(hoursSum).map(h => parseInt(h.split(':')[0])), 20);
        
        const ordersByHour = [];
        for (let i = minHour; i <= maxHour; i++) {
            const label = `${i.toString().padStart(2, '0')}:00`;
            ordersByHour.push({
                time: label,
                orders: hoursSum[label] || 0
            });
        }

        // C3. Nuevos vs Recurrentes (Retención)
        const totalCustomersPurchased = usersOrderingInCycle.length;
        const recurringCustomersCount = totalCustomersPurchased - newCustomers.length;
        
        const customerRetention = [
            { name: 'Nuevos', value: newCustomers.length, fill: '#ec4899' },
            { name: 'Recurrentes', value: recurringCustomersCount, fill: '#3b82f6' }
        ].filter(item => item.value > 0); // Hide zeros

        return {
            totalOrders,
            totalSales,
            averageTicket,
            topCustomers,
            inactiveCustomers,
            duplicateOrders,
            stagnantProducts,
            newCustomers,
            cycleEndTime,
            topProducts,
            totalUnits,
            // Nuevos datos para gráficos:
            salesByCategory,
            ordersByHour,
            customerRetention
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalOrders: 0,
            totalSales: 0,
            topCustomers: [],
            inactiveCustomers: [],
            duplicateOrders: [],
            averageTicket: 0,
            stagnantProducts: [],
            newCustomers: [],
            cycleEndTime: null,
            topProducts: [],
            totalUnits: 0
        };
    }
}
