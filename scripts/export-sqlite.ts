import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Exporting data from SQLite...");
    
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany();
    const orderItems = await prisma.orderItem.findMany();
    const cycles = await prisma.communityCycle.findMany();
    const stockLogs = await prisma.stockLog.findMany();

    const data = {
        users,
        products,
        orders,
        orderItems,
        cycles,
        stockLogs
    };

    fs.writeFileSync('db-dump.json', JSON.stringify(data, null, 2));
    console.log("Data exported successfully to db-dump.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
