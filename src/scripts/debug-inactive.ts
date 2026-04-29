
import { prisma } from "../lib/prisma";
import { getCurrentCommunityRange } from "../lib/community-cycle";

async function main() {
    const range = getCurrentCommunityRange();
    console.log("Current Range:", range);

    const store = 'alsina'; // Test with 'alsina' first
    console.log(`\n--- Debugging for Store: ${store} ---`);

    const userWhere: any = {
        isActive: true,
        role: { not: 'ADMIN' },
        assignedStore: store
    };

    const activeUsers = await prisma.user.findMany({
        where: userWhere,
        select: { id: true, name: true, email: true }
    });
    console.log(`Total Active Users in ${store}:`, activeUsers.length);
    if (activeUsers.length < 5) console.log(activeUsers);

    const buyingUsers = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: range.start,
                lte: range.end
            },
            userId: { in: activeUsers.map(u => u.id) }
        },
        select: { userId: true },
        distinct: ['userId']
    });
    console.log(`Buying Users Count:`, buyingUsers.length);

    const buyingUserIds = new Set(buyingUsers.map(o => o.userId));
    const inactive = activeUsers.filter(u => !buyingUserIds.has(u.id));

    console.log(`Inactive Users Count:`, inactive.length);
    if (inactive.length < 10) {
        inactive.forEach(u => console.log(`- ${u.name || u.email}`));
    }

    // Diagnostic: Why only 1 active user?
    console.log("\n--- Full Database Diagnostics ---");

    const totalUsers = await prisma.user.count();
    console.log("Total Users in DB:", totalUsers);

    // Group by Store
    const byStore = await prisma.user.groupBy({
        by: ['assignedStore'],
        _count: { id: true }
    });
    console.log("Users by Store:", byStore);

    // Group by Role
    const byRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
    });
    console.log("Users by Role:", byRole);

    // Group by Active Status
    const byActive = await prisma.user.groupBy({
        by: ['isActive'],
        _count: { id: true }
    });
    console.log("Users by Active Status:", byActive);

    // Show sample of non-alsina users if any
    const otherStoreUsers = await prisma.user.findMany({
        where: { assignedStore: { not: 'alsina' } },
        take: 3,
        select: { name: true, assignedStore: true }
    });
    if (otherStoreUsers.length > 0) console.log("Sample non-alsina users:", otherStoreUsers);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
