
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing data...');

    // 1. Delete Order Items (Child of Order)
    console.log('Deleting Order Items...');
    await prisma.orderItem.deleteMany({});

    // 2. Delete Orders
    console.log('Deleting Orders...');
    await prisma.order.deleteMany({});

    // 3. Delete Stock Logs
    console.log('Deleting Stock Logs...');
    await prisma.stockLog.deleteMany({});

    // 4. Reset Stock to 0 for ALL products (Optional but safer for "fresh start")
    console.log('Resetting Product Stock to 0...');
    await prisma.product.updateMany({
        data: { stock: 0 }
    });

    console.log('✨ Data cleared successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
