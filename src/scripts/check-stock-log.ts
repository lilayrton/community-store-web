
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Checking StockLog table...");

    try {
        const logs = await prisma.stockLog.findMany();
        console.log(`Success! Found ${logs.length} logs.`);
    } catch (error: any) {
        console.error("Error accessing StockLog:", error.message);
        if (error.code) console.error("Error Code:", error.code);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
