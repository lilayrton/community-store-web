
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Checking database products...");

    const total = await prisma.product.count();
    console.log(`Total products: ${total}`);

    const tracked = await prisma.product.count({ where: { isStockTracked: true } });
    console.log(`Tracked products: ${tracked}`);

    const untracked = await prisma.product.count({ where: { isStockTracked: false } });
    console.log(`Untracked products: ${untracked}`);

    const archived = await prisma.product.count({ where: { isArchived: true } });
    console.log(`Archived products: ${archived}`);

    const activeUntrackedWithStock = await prisma.product.count({
        where: {
            isStockTracked: false,
            isArchived: false
        }
    });
    console.log(`Active Untracked (should be visible): ${activeUntrackedWithStock}`);

    const sample = await prisma.product.findMany({ take: 5 });
    console.log("Sample product fields:", sample.map(p => ({ id: p.id, name: p.name, isStockTracked: p.isStockTracked })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
