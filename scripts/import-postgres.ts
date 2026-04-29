import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Reading data from db-dump.json...");
    const rawData = fs.readFileSync('db-dump.json', 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Found ${data.users.length} users, ${data.products.length} products, etc.`);

    console.log("Importing users...");
    if (data.users.length > 0) {
        await prisma.user.createMany({ data: data.users, skipDuplicates: true });
    }

    console.log("Importing products...");
    if (data.products.length > 0) {
        // Need to parse decimals if any, Prisma createMany handles it mostly
        await prisma.product.createMany({ data: data.products, skipDuplicates: true });
    }

    // Community cycles
    console.log("Importing cycles...");
    if (data.cycles.length > 0) {
        await prisma.communityCycle.createMany({ data: data.cycles, skipDuplicates: true });
    }

    // Customers if they existed (wait, schema has no customer model, it was removed?)
    // Ah, there was no Customer model in the current schema. I exported it but I don't need to import it if it's missing.

    console.log("Importing orders...");
    if (data.orders.length > 0) {
        await prisma.order.createMany({ data: data.orders, skipDuplicates: true });
    }

    console.log("Importing order items...");
    if (data.orderItems.length > 0) {
        await prisma.orderItem.createMany({ data: data.orderItems, skipDuplicates: true });
    }

    console.log("Importing stock logs...");
    if (data.stockLogs.length > 0) {
        await prisma.stockLog.createMany({ data: data.stockLogs, skipDuplicates: true });
    }

    console.log("Import completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
