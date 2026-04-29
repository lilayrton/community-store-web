import { prisma } from "@/lib/prisma";
import StoreClient, { Product } from "./StoreClient";
import { Product as PrismaProduct } from "@prisma/client";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    console.log("StorePage Rendering. Slug:", slug);

    // Check for Active Cycle
    const activeCycle = await prisma.communityCycle.findFirst({
        where: { status: 'OPEN' }
    });

    if (!activeCycle) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Tienda Cerrada
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                        Actualmente no hay una comunitaria activa. <br />
                        ¡Volvemos pronto!
                    </p>
                    <div className="text-xs text-zinc-300 dark:text-zinc-700 font-mono">
                        Sin ciclo activo
                    </div>
                </div>
            </div>
        );
    }

    // Fetch products
    let products: PrismaProduct[] = [];
    try {
        products = await prisma.product.findMany({
            where: { isArchived: false },
            orderBy: { name: 'asc' }
        });
        console.log(`Fetched ${products.length} active products from DB`);
    } catch (e) {
        console.error("CRITICAL ERROR fetching products:", e);
    }

    // Serialize products for client (Decimal to number, filter fields)
    const serializedProducts: Product[] = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price.toNumber(),
        category: p.category,
        image: p.image,
        // Add package info if needed by StoreClient, currently it might not use it but good to have
    }));

    const storeName = slug === "alsina" ? "Sucursal Alsina" : "Sucursal Malabia";

    return (
        <StoreClient
            products={serializedProducts}
            storeName={storeName}
        />
    );
}
