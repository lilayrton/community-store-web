
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(process.cwd(), 'listas', 'comu -4.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    console.log(`Starting import of ${lines.length} products...`);

    let count = 0;
    for (const line of lines) {
        const [csvId, name, packageInfo, totalPriceStr] = line.split(';');
        if (!name || !totalPriceStr) continue;

        let price = parseFloat(totalPriceStr.replace(',', '.'));
        if (isNaN(price)) price = 0;

        let packageType = "Unidad";
        let packageQuantity = 1;
        let unitPrice = price;

        if (packageInfo) {
            if (packageInfo.toLowerCase().includes('fraccion')) packageType = "Fraccion";
            else if (packageInfo.toLowerCase().includes('caja')) packageType = "Caja";
            else if (packageInfo.toLowerCase().includes('bolsa')) packageType = "Bolsa";
            else if (packageInfo.toLowerCase().includes('display')) packageType = "Display";
            else if (packageInfo.toLowerCase().includes('disp')) packageType = "Display";

            const xMatch = packageInfo.match(/x\s*(\d+)/i) || packageInfo.match(/(\d+)\s*u/i) || packageInfo.match(/X\s*(\d+)/);
            if (xMatch) packageQuantity = parseInt(xMatch[1]);

            const unitMatch = packageInfo.match(/\$(\d+[\d,.]*)/);
            if (unitMatch) {
                unitPrice = parseFloat(unitMatch[1].replace(',', '.'));
            } else if (packageQuantity > 0) {
                unitPrice = price / packageQuantity;
            }
        }

        const id = `COMU4-${csvId}`;

        await prisma.product.upsert({
            where: { id },
            update: {
                name: name.trim(),
                price: price,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: packageQuantity,
                format: packageInfo.trim(),
                isArchived: false,
                category: "General"
            },
            create: {
                id,
                name: name.trim(),
                price: price,
                unitPrice: unitPrice,
                packageType: packageType,
                packageQuantity: packageQuantity,
                format: packageInfo.trim(),
                isArchived: false,
                category: "General",
                stock: 0,
                isStockTracked: false
            }
        });
        count++;
        if (count % 50 === 0) console.log(`Imported ${count}...`);
    }

    console.log(`Done! Imported ${count} products.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
