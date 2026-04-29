import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.product.count({
        where: { isStockTracked: false, isArchived: false }
    });
    const totalArchived = await prisma.product.count({
        where: { isStockTracked: false, isArchived: true }
    });
    console.log(`Active untracked: ${total}, Archived untracked: ${totalArchived}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
