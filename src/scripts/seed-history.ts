
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { subWeeks, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function parseCSV(filePath: string, categoryDefault: string, dateReference: Date) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    console.log(`Processing ${path.basename(filePath)} (${lines.length} items)...`);

    for (const line of lines) {
        const cols = line.split(';');
        if (cols.length < 4) continue;

        // format: ID;Name;FormatLabel;Price;...
        const name = cols[1]?.trim();
        const formatRaw = cols[2]?.trim();
        const priceRaw = cols[3]?.trim();

        if (!name || !priceRaw) continue;

        const price = parseFloat(priceRaw.replace(',', '.').replace('$', '')) || 0;

        // Extract Details from Format
        // Example: "Fraccion x6u $1900c/u"
        let packageType = "Unidad";
        if (formatRaw.toLowerCase().includes("fraccion") || formatRaw.toLowerCase().includes("fracc")) packageType = "Fraccion";
        else if (formatRaw.toLowerCase().includes("display") || formatRaw.toLowerCase().includes("disp")) packageType = "Display";
        else if (formatRaw.toLowerCase().includes("caja")) packageType = "Caja";
        else if (formatRaw.toLowerCase().includes("bolsa")) packageType = "Bolsa";

        // Extract Quantity: "x20u", "x6", "12u"
        let quantity = 1;
        const qtyMatch = formatRaw.match(/x\s*(\d+)/i) || formatRaw.match(/(\d+)\s*u/i);
        if (qtyMatch) {
            quantity = parseInt(qtyMatch[1], 10);
        }

        // Extract Unit Price: "$1900c/u"
        let unitPrice: number | null = null;
        const unitPriceMatch = formatRaw.match(/\$\s*([0-9.,]+)\s*c\/u/i);
        if (unitPriceMatch) {
            unitPrice = parseFloat(unitPriceMatch[1].replace(',', '.'));
        }

        // Create Product
        // We use "upsert" based on name to avoid duplicates if running multiple times, 
        // but since we want to simulate history, we might just want to ensure the product exists
        // and create an OrderItem for it in a "fake" order to simulate it being in that cycle.

        // Actually, the goal is to populate the "Catalog" available for import.
        // Importing from "4 weeks ago" reads from *Ordered Items*.
        // So we need to create a FAKE ORDER for that date containing these items.

        // 1. Ensure Product Exists (Source of Truth)
        const product = await prisma.product.upsert({
            where: { id: `legacy-${cols[0]}` }, // Use legacy ID to be stable
            update: {
                price: price, // Update to latest price from CSV
                format: formatRaw,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: quantity,
                isArchived: true // Archived by default, "Catalog Creator" will wake them up
            },
            create: {
                id: `legacy-${cols[0]}`,
                name: name,
                category: categoryDefault,
                price: price,
                format: formatRaw,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: quantity,
                isArchived: true
            }
        });

        // 2. Create Fake Order to place it in history
        // We need an order in the target date range.
        // Let's create ONE master order for the whole csv if it doesn't exist.
    }

    // Create a master order for this cycle containing all items
    // to simulate efficient querying.
    const masterOrder = await prisma.order.create({
        data: {
            total: 0, // Dummy
            status: "DELIVERED",
            createdAt: dateReference,
            items: {
                create: lines.map(line => {
                    const cols = line.split(';');
                    if (cols.length < 4) return null;
                    const quantity = 1; // Sold 1 unit effectively
                    return {
                        productId: `legacy-${cols[0]}`,
                        quantity: 1,
                        price: 0
                    };
                }).filter(x => x !== null) as any
            }
        }
    });

    console.log(`Creating history order for ${dateReference.toISOString()} with ${masterOrder.id}`);
}

async function main() {
    const cycles = [
        { file: 'cycle-1.csv', weeksAgo: 5, category: 'Varios' },
        { file: 'cycle-2.csv', weeksAgo: 4, category: 'Varios' },
        { file: 'cycle-3.csv', weeksAgo: 3, category: 'Varios' },
        { file: 'cycle-4.csv', weeksAgo: 2, category: 'Varios' },
        { file: 'cycle-5.csv', weeksAgo: 1, category: 'Varios' },
    ];

    const today = new Date();

    // 1. Process Regular Cycles
    for (const cycle of cycles) {
        const filePath = path.join(process.cwd(), 'seeds', 'history', cycle.file);
        if (fs.existsSync(filePath)) {
            // Set date to a Sunday noon of that week to be safe within the cycle
            const date = subDays(today, cycle.weeksAgo * 7);
            await parseCSV(filePath, cycle.category, date);
        }
    }

    // 2. Process Cigarettes (Special "Add-on" Cycle, treated as very recent or static)
    // Let's put them on a date far back or flagged? 
    // Actually, user wants to "Add Cigarettes". We can just ensure they exist in DB.
    // We'll give them a specific "Cigarrillos" category and maybe a specific old date 
    // so we can "Import from Cigarettes List" by date or just by Category.
    // Let's import them as a distinct group order from "Yesterday" so they appear in "Last Week" 
    // or just ensure they are in the DB.
    // Best Approach: Create a dummy order for them "6 weeks ago" (Cycle -6) as hinted by user.
    const cigPath = path.join(process.cwd(), 'seeds', 'history', 'cycle de cigarrillos.csv');
    if (fs.existsSync(cigPath)) {
        await parseCSV(cigPath, 'Tabaquería', subDays(today, 42)); // 6 weeks ago
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
