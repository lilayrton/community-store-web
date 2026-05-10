import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(process.cwd(), 'listas', 'comu -3.csv');
    if (!fs.existsSync(csvPath)) {
        console.error("CSV NOT FOUND at:", csvPath);
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    console.log(`Starting import of ${lines.length} products to database...`);

    let count = 0;
    for (const line of lines) {
        const parts = line.split(';');
        if (parts.length < 4) continue;

        const csvId = parts[0].trim();
        const name = parts[1].trim();
        const packageInfo = parts[2].trim();
        const totalPriceStr = parts[3].trim().replace(/\./g, '').replace(',', '.');
        
        let price = parseFloat(totalPriceStr);
        if (isNaN(price)) price = 0;

        let packageType = "Unidad";
        let packageQuantity = 1;
        let unitPrice = price;

        if (packageInfo) {
            const lowInfo = packageInfo.toLowerCase();
            if (lowInfo.includes('fraccion')) packageType = "Fraccion";
            else if (lowInfo.includes('caja')) packageType = "Caja";
            else if (lowInfo.includes('bolsa')) packageType = "Bolsa";
            else if (lowInfo.includes('display')) packageType = "Display";
            else if (lowInfo.includes('disp')) packageType = "Display";

            const xMatch = packageInfo.match(/x\s*(\d+)/i) || packageInfo.match(/(\d+)\s*u/i) || packageInfo.match(/X\s*(\d+)/);
            if (xMatch) packageQuantity = parseInt(xMatch[1]);

            if (packageQuantity > 0) {
                unitPrice = price / packageQuantity;
            }
        }

        const id = `COMU3-${csvId}`;

        await prisma.product.upsert({
            where: { id },
            update: {
                name: name,
                price: price,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: packageQuantity,
                format: packageInfo,
                isArchived: false,
                category: "Golosinas",
                provider: "Comu3",
                displayOrder: count // Preserve original order
            },
            create: {
                id,
                name: name,
                price: price,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: packageQuantity,
                format: packageInfo,
                isArchived: false,
                category: "Golosinas",
                stock: 0,
                isStockTracked: false,
                provider: "Comu3",
                displayOrder: count // Preserve original order
            }
        });
        count++;
        if (count % 50 === 0) console.log(`Imported ${count}...`);
    }

    console.log(`Done! Imported ${count} products into the database.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
