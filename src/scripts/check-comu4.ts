
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.product.count({ where: { id: { startsWith: 'COMU4-' } } });
    console.log('Count:', count);
}
main().finally(() => prisma.$disconnect());
