
import { prisma } from "../lib/prisma";
import { getCurrentCommunityRange } from "../lib/community-cycle";

async function main() {
    const range = getCurrentCommunityRange();
    console.log("Current Range:", range);

    const store = 'alsina'; // Default test

    // mimic getDashboardStats logic
    const salesRangeWhere = {
        createdAt: {
            gte: range.start,
            lte: range.end
        },
        store: store
    };

    console.log("Querying Orders with:", salesRangeWhere);

    const orders = await prisma.order.findMany({
        where: salesRangeWhere,
        select: { id: true, total: true }
    });
    console.log(`Found ${orders.length} orders in this cycle.`);

    if (orders.length === 0) {
        console.log("No orders = No Top Product. This explains why it might be missing.");

        // Check PAST cycle just to see if data exists previously
        const allOrders = await prisma.order.count();
        console.log(`Total orders in DB (lifetime): ${allOrders}`);
        return;
    }

    // Check OrderItems
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
        take: 5
    });

    console.log("Top Product Groups:", topProductGroup);

    if (topProductGroup.length > 0) {
        const topId = topProductGroup[0].productId;
        const prod = await prisma.product.findUnique({
            where: { id: topId }
        });
        console.log("Top Product Details:", prod);
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
