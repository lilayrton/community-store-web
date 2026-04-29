import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.product.count();
    const untracked = await prisma.product.count({ where: { isStockTracked: false } });
    const tracked = await prisma.product.count({ where: { isStockTracked: true } });
    console.log(`Total: ${total}, Untracked: ${untracked}, Tracked: ${tracked}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
