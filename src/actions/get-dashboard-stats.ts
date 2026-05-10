"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats(store?: string) {
    try {
        const where: any = store ? { store } : {};

        // 1. Get active cycle or latest closed cycle to define the range
        const activeCycle = await prisma.communityCycle.findFirst({
            where: { status: "OPEN" },
            orderBy: { createdAt: "desc" }
        });
        
        let cycleFilterWhere: any = {};
        let cycleStartDate: Date;
        let cycleEndDate: Date = new Date();

        if (activeCycle) {
            cycleStartDate = activeCycle.startDate;
            cycleFilterWhere = {
                OR: [
                    { cycleId: activeCycle.id },
                    { createdAt: { gte: cycleStartDate } }
                ]
            };
        } else {
            const latestClosed = await prisma.communityCycle.findFirst({
                where: { status: "CLOSED" },
                orderBy: { endDate: "desc" }
            });
            if (latestClosed) {
                cycleStartDate = latestClosed.startDate;
                cycleEndDate = latestClosed.endDate || new Date();
                cycleFilterWhere = {
                    OR: [
                        { cycleId: latestClosed.id },
                        { 
                            createdAt: { 
                                gte: cycleStartDate,
                                lte: cycleEndDate
                            } 
                        }
                    ]
                };
            } else {
                cycleStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days fallback
                cycleFilterWhere = {
                    createdAt: { gte: cycleStartDate }
                };
            }
        }

        const salesRangeWhere = {
            ...cycleFilterWhere,
            ...where
        };

        // 2. Basic Counts
        const totalOrders = await prisma.order.count({
            where: salesRangeWhere,
        });

        // 3. Sales Aggregation
        const salesAggregate = await prisma.order.aggregate({
            _sum: {
                total: true,
            },
            where: salesRangeWhere,
        });
        const totalSales = salesAggregate._sum && salesAggregate._sum.total ? Number(salesAggregate._sum.total) : 0;

        // 4. Average Ticket
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        // 5. Top Customers
        const groupedOrders = await prisma.order.groupBy({
            by: ['userId'],
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...salesRangeWhere,
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
                lastOrderDate: cycleEndDate.toISOString()
            };
        });

        // 6. Inactive Customers
        const userWhere: any = {
            isActive: true,
            role: { not: 'ADMIN' }
        };
        if (store) {
            userWhere.assignedStore = store;
        }

        const activeUsers = await prisma.user.findMany({
            where: userWhere,
            select: { id: true, name: true, phone: true, email: true }
        });

        const buyingUsers = await prisma.order.findMany({
            where: {
                ...salesRangeWhere,
                userId: { in: activeUsers.map(u => u.id) }
            },
            select: { userId: true },
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

        // 7. Duplicate Orders
        const potentialDuplicates = await prisma.order.groupBy({
            by: ['userId'],
            where: {
                ...salesRangeWhere,
                userId: { not: null }
            },
            _count: { id: true },
            having: {
                id: { _count: { gt: 1 } }
            }
        });

        let duplicateOrders: any[] = [];
        if (potentialDuplicates.length > 0) {
            const dupUserIds = potentialDuplicates.map(d => d.userId) as string[];
            const dupOrders = await prisma.order.findMany({
                where: {
                    userId: { in: dupUserIds },
                    ...salesRangeWhere
                },
                include: {
                    user: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            duplicateOrders = dupOrders.map(order => ({
                id: order.id,
                customerName: order.user?.name || order.user?.email || "Sin Nombre",
                value: Number(order.total),
                time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
        }

        // 8. Stagnant Products
        const allProducts = await prisma.product.findMany({
            where: { isArchived: false },
            select: { id: true, name: true, price: true, category: true }
        });

        const soldProductIds = await prisma.orderItem.findMany({
            where: {
                order: salesRangeWhere
            },
            select: { productId: true },
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
            .slice(0, 10);

        // 9. New Customers (First order ever in this range)
        const usersOrderingInCycle = await prisma.user.findMany({
            where: {
                orders: { some: salesRangeWhere }
            }
        });

        const newCustomerIds: string[] = [];
        for (const user of usersOrderingInCycle) {
            const previousOrdersCount = await prisma.order.count({
                where: {
                    userId: user.id,
                    createdAt: { lt: cycleStartDate }
                }
            });
            if (previousOrdersCount === 0) {
                newCustomerIds.push(user.id);
            }
        }

        const newCustomers = await prisma.user.findMany({
            where: { id: { in: newCustomerIds } },
            select: { id: true, name: true, email: true, phone: true }
        }).then(users => users.map(u => ({
            id: u.id,
            name: u.name || "Sin nombre",
            email: u.email,
            phone: u.phone
        })));

        // 10. Top Selling Products
        const topProductGroup = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: salesRangeWhere },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10
        });

        const totalUnitsGroup = await prisma.orderItem.aggregate({
            _sum: { quantity: true },
            where: { order: salesRangeWhere }
        });
        const totalUnits = totalUnitsGroup._sum.quantity || 0;

        const topProducts = [];
        if (topProductGroup.length > 0) {
            const productIds = topProductGroup.map(g => g.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true }
            });

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

        // 11. Charts Data
        const orderItemsWithProducts = await prisma.orderItem.findMany({
            where: { order: salesRangeWhere },
            select: { quantity: true, product: { select: { category: true } } }
        });
        
        const categorySum: Record<string, number> = {};
        for (const item of orderItemsWithProducts) {
             const cat = item.product?.category || 'Otros';
             categorySum[cat] = (categorySum[cat] || 0) + item.quantity;
        }
        const salesByCategory = Object.entries(categorySum)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value);

        const ordersForHours = await prisma.order.findMany({
            where: salesRangeWhere,
            select: { createdAt: true }
        });
        
        const hoursSum: Record<string, number> = {};
        for (const order of ordersForHours) {
            // Adjust to Argentina Time (GMT-3)
            const date = new Date(order.createdAt);
            const argentinaDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
            const hour = argentinaDate.getHours();
            
            const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
            hoursSum[hourLabel] = (hoursSum[hourLabel] || 0) + 1;
        }
        
        const ordersByHour = [];
        for (let i = 8; i <= 21; i++) {
            const label = `${i.toString().padStart(2, '0')}:00`;
            ordersByHour.push({
                time: label,
                orders: hoursSum[label] || 0
            });
        }

        const totalCustomersPurchased = usersOrderingInCycle.length;
        const recurringCustomersCount = totalCustomersPurchased - newCustomers.length;
        const customerRetention = [
            { name: 'Nuevos', value: newCustomers.length, fill: '#ec4899' },
            { name: 'Recurrentes', value: recurringCustomersCount, fill: '#3b82f6' }
        ].filter(item => item.value > 0);

        return {
            totalOrders,
            totalSales,
            averageTicket,
            topCustomers,
            inactiveCustomers,
            duplicateOrders,
            stagnantProducts,
            newCustomers,
            cycleEndTime: cycleEndDate.toISOString(),
            topProducts,
            totalUnits,
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
            totalUnits: 0,
            salesByCategory: [],
            ordersByHour: [],
            customerRetention: []
        };
    }
}

