
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.product.deleteMany({
        where: { NOT: { id: { startsWith: 'legacy-' } } }
    });

    console.log(`Deleted ${deleted.count} test products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
