
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Identify Test Products
    const testProducts = await prisma.product.findMany({
        where: { NOT: { id: { startsWith: 'legacy-' } } },
        select: { id: true }
    });

    const ids = testProducts.map(p => p.id);
    console.log(`Found ${ids.length} test products to delete.`);

    if (ids.length === 0) return;

    // 2. Delete related OrderItems first (Cascade manually)
    const deletedItems = await prisma.orderItem.deleteMany({
        where: { productId: { in: ids } }
    });
    console.log(`Deleted ${deletedItems.count} related OrderItems.`);

    // 3. Delete Products
    const deletedProducts = await prisma.product.deleteMany({
        where: { id: { in: ids } }
    });

    console.log(`Deleted ${deletedProducts.count} Test Products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
