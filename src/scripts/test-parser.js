const fs = require('fs');
const path = require('path');

async function test() {
    const filePath = path.join(process.cwd(), 'listas', 'comu -3.csv');
    console.log("Reading file:", filePath);
    
    if (!fs.existsSync(filePath)) {
        console.error("FILE NOT FOUND!");
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    console.log(`Total lines: ${lines.length}`);

    const products = [];
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const parts = line.split(';');
        console.log(`Line ${i}: parts count ${parts.length}, content: ${line.substring(0, 50)}...`);
        
        if (parts.length >= 4) {
            const totalPriceStr = parts[3].trim().replace(/\./g, '').replace(',', '.');
            const totalPrice = parseFloat(totalPriceStr);
            products.push({ name: parts[1], price: totalPrice });
        }
    }
    console.log("Parsed sample count:", products.length);
}

test();
