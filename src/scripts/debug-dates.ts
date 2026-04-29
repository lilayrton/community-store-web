
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        select: {
            id: true,
            createdAt: true,
            _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log("--- Orders in Database ---");
    orders.forEach(o => {
        console.log(`Order ${o.id}: ${o.createdAt.toISOString()} (${o._count.items} items)`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
