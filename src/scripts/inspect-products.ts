
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allProducts = await prisma.product.count();
    const legacyProducts = await prisma.product.count({
        where: { id: { startsWith: 'legacy-' } }
    });

    console.log(`Total Products: ${allProducts}`);
    console.log(`Legacy (Imported) Products: ${legacyProducts}`);
    console.log(`Potential Test Products: ${allProducts - legacyProducts}`);

    if (allProducts - legacyProducts > 0) {
        const sample = await prisma.product.findMany({
            where: { NOT: { id: { startsWith: 'legacy-' } } },
            take: 10,
            select: { id: true, name: true }
        });
        console.log("Sample of potential test products:", sample);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
