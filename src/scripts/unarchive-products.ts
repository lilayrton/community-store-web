
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Unarchiving all products...");

    const result = await prisma.product.updateMany({
        where: { isArchived: true },
        data: { isArchived: false }
    });

    console.log(`Unarchived ${result.count} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
