import { getComu3Products } from './src/actions/admin/catalog-actions';

async function test() {
    console.log("Testing getComu3Products...");
    const products = await getComu3Products();
    console.log(`Result: ${products.length} products found.`);
    if (products.length > 0) {
        console.log("First product sample:", products[0]);
    } else {
        console.log("No products returned.");
    }
}

test();
