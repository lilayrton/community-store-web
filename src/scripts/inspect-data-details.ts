
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 20,
        select: {
            id: true,
            name: true,
            price: true,
            packageType: true,
            packageQuantity: true,
            unitPrice: true,
            format: true
        }
    });

    console.log("--- Inspecting First 20 Products ---");
    products.forEach(p => {
        console.log(`[${p.id.substring(0, 8)}] ${p.name}`);
        console.log(`   Price: ${p.price}`);
        console.log(`   Format: ${p.format}`);
        console.log(`   Details: Type=${p.packageType}, Qty=${p.packageQuantity}, UnitPrice=${p.unitPrice}`);
        console.log("---------------------------------------------------");
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
