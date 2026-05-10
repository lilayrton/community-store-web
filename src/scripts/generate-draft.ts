
import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'listas', 'comu -4.csv');
const content = fs.readFileSync(csvPath, 'utf-8');

const lines = content.split('\n').filter(line => line.trim() !== '');

const parsed = lines.map(line => {
    const [id, name, packageInfo, totalPriceStr] = line.split(';');
    if (!name || !totalPriceStr) return null;
    
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

        const xMatch = packageInfo.match(/x\s*(\d+)/i) || packageInfo.match(/(\d+)\s*u/i) || packageInfo.match(/X\s*(\d+)/);
        if (xMatch) packageQuantity = parseInt(xMatch[1]);

        const unitMatch = packageInfo.match(/\$(\d+[\d,.]*)/);
        if (unitMatch) {
            unitPrice = parseFloat(unitMatch[1].replace(',', '.'));
        } else if (packageQuantity > 0) {
            unitPrice = price / packageQuantity;
        }
    }

    return {
        id: `COMU4-${id}`,
        name: name.trim(),
        price,
        category: "General",
        packageType,
        packageQuantity,
        unitPrice,
        isActive: true,
        isStockTracked: false,
        format: packageInfo.trim()
    };
}).filter(p => p !== null);

fs.writeFileSync('comu4-draft.json', JSON.stringify(parsed));
console.log('Saved 301 products to comu4-draft.json');
