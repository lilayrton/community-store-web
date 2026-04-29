
import { prisma } from "../lib/prisma";
import { getCurrentCommunityRange } from "../lib/community-cycle";

async function main() {
    const range = getCurrentCommunityRange();
    console.log("Current Range:", range);

    // Try finding user broadly
    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: "yrton"
            }
        }
    });

    if (users.length === 0) {
        console.log("No user found matching 'yrton'");
        return;
    }

    const user = users[0];
    console.log("Found User:", user.name, user.id);

    const orders = await prisma.order.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log(`Total Orders for ${user.name}:`, orders.length);

    const inRangeOrders = orders.filter(o => o.createdAt >= range.start && o.createdAt <= range.end);
    console.log("Orders in Current Range:", inRangeOrders.length);

    inRangeOrders.forEach(o => {
        console.log(`- Order ${o.id}: ${o.createdAt.toLocaleString()} (${o.store})`);
    });

    // Check Duplicate Logic as per server action
    const potentialDuplicates = await prisma.order.groupBy({
        by: ['userId'],
        where: {
            createdAt: {
                gte: range.start,
                lte: range.end
            },
            userId: user.id
        },
        _count: {
            id: true
        }
    });

    console.log("Group by result:", potentialDuplicates);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
