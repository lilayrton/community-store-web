
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Fetching latest 5 StockLogs...");

    const logs = await prisma.stockLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log(JSON.stringify(logs, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
