
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Testing StockLog referenceId...");

    try {
        // Attempt to create a log with referenceId
        // If the client types/runtime don't support it, this might throw or TS check fail (but we are running via tsx which compiles on fly)
        // Runtime validation by Prisma Engine will fail if Client doesn't pass it, OR if Client passes it but DB rejects (DB has it, so DB is fine).
        // If Client DOESN'T know about it, it will complain "Unknown argument".
        await prisma.stockLog.create({
            data: {
                productId: "TEST-LINK",
                productName: "Test Link",
                oldStock: 0,
                newStock: 0,
                change: 0,
                username: "Test Script",
                referenceId: "TEST-REF-ID"
            }
        });
        console.log("Success! Prisma Client accepts referenceId.");

        // Clean up
        await prisma.stockLog.deleteMany({ where: { productId: "TEST-LINK" } });

    } catch (error: any) {
        console.error("Error creating StockLog with referenceId:");
        console.error(error.message);
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
