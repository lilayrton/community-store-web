'use server';

import { prisma } from "@/lib/prisma";
import { subWeeks } from "date-fns";

export type CatalogProduct = {
    id: string;
    name: string;
    price: number;
    category: string;
    format: string | null;
    unitPrice: number | null;
    stock: number;
    packageType: string | null;
    packageQuantity: number | null;
    isActive: boolean;
    isStockTracked: boolean;
    provider?: string | null;
};

export async function getInventoryProducts(limit = 100): Promise<CatalogProduct[]> {
    try {
        const products = await prisma.product.findMany({
            where: { isArchived: false },
            orderBy: [{ isStockTracked: 'desc' }, { name: 'asc' }],
            take: limit
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: !p.isArchived,
            isStockTracked: p.isStockTracked || false,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }
}

export async function getRecentCycles(limit = 5) {
    try {
        const cycles = await prisma.communityCycle.findMany({
            where: { status: 'CLOSED' },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return cycles;
    } catch (error) {
        console.error("Error fetching cycles:", error);
        return [];
    }
}

export async function getQuinteroProducts(): Promise<CatalogProduct[]> {
    try {
        const products = await prisma.product.findMany({
            where: { isStockTracked: true, isArchived: false },
            orderBy: { name: 'asc' }
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: true, // If we import them for a cycle, we probably want them active
            isStockTracked: true,
            provider: p.provider || "Quintero"
        }));
    } catch (error) {
        console.error("Error fetching Quintero products:", error);
        return [];
    }
}

export async function searchInventoryProducts(query: string): Promise<CatalogProduct[]> {
    try {
        console.log("Searching inventory for:", query);
        const products = await prisma.product.findMany({
            where: {
                isArchived: false,
                name: { contains: query }
            },
            orderBy: [{ isStockTracked: 'desc' }, { name: 'asc' }],
            take: 100
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: !p.isArchived,
            isStockTracked: p.isStockTracked || false,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error searching inventory:", error);
        return [];
    }
}

export async function searchUntrackedProducts(query: string): Promise<CatalogProduct[]> {
    try {
        console.log("Searching untracked products for:", query);
        const products = await prisma.product.findMany({
            where: {
                isStockTracked: false, // ONLY untracked
                name: { contains: query }
            },
            take: 50,
            orderBy: { name: 'asc' }
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: !p.isArchived,
            isStockTracked: false,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error searching untracked products:", error);
        return [];
    }
}

export async function getUntrackedProducts(limit = 100): Promise<CatalogProduct[]> {
    try {
        const products = await prisma.product.findMany({
            where: {
                isStockTracked: false
            },
            take: limit,
            orderBy: { name: 'asc' }
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: !p.isArchived,
            isStockTracked: false,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error fetching untracked products:", error);
        return [];
    }
}

export async function updateProductStock(id: string, newStock: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: { stock: newStock }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export type InventoryChange = {
    id: string;
    stock?: number;
    isStockTracked?: boolean;
    name: string; // Required for log
    oldStock: number; // Required for log
};

export async function batchUpdateInventory(changes: InventoryChange[], username: string = "Admin") {
    try {
        await prisma.$transaction(async (tx) => {
            for (const change of changes) {
                // Update Product
                await tx.product.update({
                    where: { id: change.id },
                    data: {
                        ...(change.stock !== undefined && { stock: change.stock }),
                        ...(change.isStockTracked !== undefined && { isStockTracked: change.isStockTracked }),
                    }
                });

                // Create Log if stock changed
                if (change.stock !== undefined && change.stock !== change.oldStock) {
                    await tx.stockLog.create({
                        data: {
                            productId: change.id,
                            productName: change.name,
                            oldStock: change.oldStock,
                            newStock: change.stock,
                            change: change.stock - change.oldStock,
                            username: username,
                            createdAt: new Date()
                        }
                    });
                }
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Batch update failed:", error);
        return { success: false, error };
    }
}

export async function getStockHistory(limit = 50) {
    try {
        const logs = await prisma.stockLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return logs;
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

export async function toggleStockTracking(id: string, isTracked: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isStockTracked: isTracked }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function getProductsFromCycle(cyclesAgo: number): Promise<CatalogProduct[]> {
    try {
        console.log(`[Catalog] Requesting products from ${cyclesAgo} cycles ago.`);

        // 1. Find the target cycle
        // If cyclesAgo = 1, we want the LATEST cycle (skip 0)
        // If cyclesAgo = 2, we want the one before that (skip 1)
        const skip = Math.max(0, cyclesAgo - 1);

        const targetCycle = await prisma.communityCycle.findFirst({
            orderBy: { createdAt: 'desc' },
            skip: skip,
            include: {
                orders: {
                    include: { items: true }
                }
            }
        });

        if (!targetCycle) {
            console.log(`[Catalog] No cycle found for offset ${skip} (cyclesAgo: ${cyclesAgo}).`);
            return [];
        }

        console.log(`[Catalog] Found Cycle: ${targetCycle.name} (${targetCycle.id})`);
        console.log(`[Catalog] Found ${targetCycle.orders.length} orders in this cycle.`);

        const productIds = new Set<string>();
        targetCycle.orders.forEach((order) => {
            order.items.forEach((item) => productIds.add(item.productId));
        });

        console.log(`[Catalog] extracted ${productIds.size} unique product IDs.`);

        if (productIds.size === 0) {
            return [];
        }

        const products = await prisma.product.findMany({
            where: { id: { in: Array.from(productIds) } },
            orderBy: { category: 'asc' }
        });

        console.log(`[Catalog] Returning ${products.length} products.`);

        const validProducts = products.filter((p: any) => {
            // Filter out tracked products with 0 stock
            if (p.isStockTracked && p.stock <= 0) {
                return false;
            }
            return true;
        }).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: true,
            isStockTracked: (p as any).isStockTracked || false,
            provider: p.provider
        }));

        return validProducts;

    } catch (error) {
        console.error("[Catalog] Error fetching cycle products:", error);
        return [];
    }
}

export async function publishCatalog(products: CatalogProduct[]) {
    try {
        console.log(`[Catalog] Publishing ${products.length} products...`);

        return await prisma.$transaction(async (tx) => {

            // 1. First, Archive ALL currently active products.
            await tx.product.updateMany({
                where: { isArchived: false },
                data: { isArchived: true }
            });

            // 2. Process all products in the list to maintain their order
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const isNew = p.id.startsWith("MANUAL-");

                if (isNew) {
                    await tx.product.create({
                        data: {
                            name: p.name,
                            price: p.price,
                            category: p.category,
                            stock: 0,
                            isArchived: !p.isActive,
                            format: p.format || null,
                            packageType: p.packageType || "Unidad",
                            packageQuantity: p.packageQuantity || 1,
                            unitPrice: p.unitPrice || p.price,
                            isStockTracked: p.isStockTracked,
                            provider: p.provider,
                            displayOrder: i // Maintain order
                        }
                    });
                } else {
                    await tx.product.update({
                        where: { id: p.id },
                        data: {
                            price: p.price,
                            unitPrice: p.unitPrice,
                            packageType: p.packageType,
                            packageQuantity: p.packageQuantity,
                            isArchived: !p.isActive,
                            provider: p.provider,
                            displayOrder: i, // Maintain order
                            updatedAt: new Date()
                        }
                    });
                }
            }

            return { success: true, count: products.length };
        });

    } catch (error) {
        console.error("[Catalog] Publish failed:", error);
        return { success: false, error };
    }
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
    try {
        const whereClause = query && query.trim().length > 0 ? { name: { contains: query } } : {};

        const products = await prisma.product.findMany({
            where: whereClause,
            take: 100,
            orderBy: { name: 'asc' }
        });

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: true, // Newly added products are active by default
            isStockTracked: (p as any).isStockTracked || false,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
}

export async function createInventoryProducts(products: Partial<CatalogProduct>[]) {
    try {
        console.log(`[Inventory] Creating ${products.length} products...`);

        const createdProducts: CatalogProduct[] = [];

        await prisma.$transaction(async (tx) => {
            for (const p of products) {
                if (!p.name) continue;

                const newProduct = await tx.product.create({
                    data: {
                        name: p.name,
                        price: Number(p.price) || 0,
                        category: p.category || "General",
                        stock: Number(p.stock) || 0,
                        isArchived: false,
                        isStockTracked: p.isStockTracked ?? true, // Default to tracked
                        format: p.format || null,
                        packageType: p.packageType || "Unidad",
                        packageQuantity: Number(p.packageQuantity) || 1,
                        unitPrice: (Number(p.price) || 0) / (Number(p.packageQuantity) || 1),
                        provider: p.provider,
                    }
                });

                createdProducts.push({
                    id: newProduct.id,
                    name: newProduct.name,
                    price: Number(newProduct.price),
                    category: newProduct.category,
                    format: newProduct.format,
                    unitPrice: newProduct.unitPrice ? Number(newProduct.unitPrice) : null,
                    stock: newProduct.stock,
                    packageType: newProduct.packageType,
                    packageQuantity: newProduct.packageQuantity,
                    isActive: !newProduct.isArchived,
                    isStockTracked: newProduct.isStockTracked,
                    provider: newProduct.provider
                });

                // Create Initial Stock Log
                if (newProduct.isStockTracked) {
                    await tx.stockLog.create({
                        data: {
                            productId: newProduct.id,
                            productName: newProduct.name,
                            oldStock: 0,
                            newStock: newProduct.stock,
                            change: newProduct.stock,
                            username: "Admin",
                            referenceId: "CREATION",
                            createdAt: new Date()
                        }
                    });
                }
            }
        });

        // Fetch the newly created logs to return them (or construct them manually to save a query)
        // Manual construction is faster and valid here since we just created them.
        const newLogs = createdProducts.filter(p => p.isStockTracked).map(p => ({
            id: "temp-" + Math.random(), // Temporary ID for UI until refresh
            productId: p.id,
            productName: p.name,
            oldStock: 0,
            newStock: p.stock,
            change: p.stock,
            username: "Admin",
            createdAt: new Date()
        }));

        return { success: true, createdProducts, newLogs };
    } catch (error) {
        console.error("Error creating inventory products:", error);
        return { success: false, error };
    }
}

export async function getAllSystemProducts(query: string = "", page: number = 1, limit: number = 100) {
    try {
        const whereClause: any = {};
        
        if (query && query.trim() !== "") {
            whereClause.OR = [
                { name: { contains: query } },
                { provider: { contains: query } }
            ];
        }

        const [products, total, activeCount] = await prisma.$transaction([
            prisma.product.findMany({
                where: whereClause,
                orderBy: [{ isArchived: 'asc' }, { name: 'asc' }],
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.product.count({ where: whereClause }),
            prisma.product.count({ where: { ...whereClause, isArchived: false } })
        ]);

        const mappedProducts = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            isActive: !p.isArchived,
            isStockTracked: p.isStockTracked || false,
            provider: p.provider
        }));

        return { products: mappedProducts, total, activeCount };
    } catch (error) {
        console.error("Error fetching system products:", error);
        return { products: [], total: 0, activeCount: 0 };
    }
}

export async function toggleProductActiveStatus(id: string, isActive: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isArchived: !isActive }
        });
        return { success: true };
    } catch (error) {
        console.error("Error toggling product status:", error);
        return { success: false, error };
    }
}

export async function updateProductDetails(id: string, data: Partial<CatalogProduct>) {
    try {
        const updateData: any = {
            ...(data.name && { name: data.name }),
            ...(data.category && { category: data.category }),
            ...(data.provider !== undefined && { provider: data.provider }),
            ...(data.packageType !== undefined && { packageType: data.packageType }),
            ...(data.format !== undefined && { format: data.format }),
        };

        if (data.price !== undefined) {
            updateData.price = data.price;
            const pkgQty = data.packageQuantity || 1;
            updateData.packageQuantity = pkgQty;
            updateData.unitPrice = data.price / pkgQty;
        } else if (data.packageQuantity !== undefined) {
            updateData.packageQuantity = data.packageQuantity;
            const current = await prisma.product.findUnique({ where: { id } });
            if (current) {
                updateData.unitPrice = Number(current.price) / data.packageQuantity;
            }
        }

        const updated = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return { 
            success: true, 
            product: {
                id: updated.id,
                name: updated.name,
                price: Number(updated.price),
                category: updated.category,
                format: updated.format,
                unitPrice: updated.unitPrice ? Number(updated.unitPrice) : null,
                stock: updated.stock,
                packageType: updated.packageType,
                packageQuantity: updated.packageQuantity,
                isActive: !updated.isArchived,
                isStockTracked: updated.isStockTracked,
                provider: updated.provider
            } 
        };
    } catch (error) {
        console.error("Error updating product details:", error);
        return { success: false, error };
    }
}
export async function getComu3Products(): Promise<CatalogProduct[]> {
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'listas', 'comu -3.csv');
        
        if (!fs.existsSync(filePath)) {
            console.error("CSV file not found:", filePath);
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        const products: CatalogProduct[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(';');
            if (parts.length < 4) continue;

            const id = `COMU3-${parts[0].trim()}`;
            const name = parts[1].trim();
            const format = parts[2].trim();
            const totalPriceStr = parts[3].trim().replace(/\./g, '').replace(',', '.');
            const totalPrice = parseFloat(totalPriceStr);

            // Extract unit price if possible from format "Display x24u $2541,66 c/u"
            let unitPrice = totalPrice;
            let pkgQty = 1;
            
            const qtyMatch = format.match(/x\s*(\d+)/i) || format.match(/(\d+)\s*u/i);
            if (qtyMatch) {
                pkgQty = parseInt(qtyMatch[1]);
                unitPrice = totalPrice / pkgQty;
            }

            products.push({
                id,
                name,
                price: totalPrice,
                category: "Golosinas", // Default or detect from name? For now Golosinas seems appropriate for Comu3
                format,
                packageType: format.toLowerCase().includes('display') ? 'Display' : 'Fraccion',
                packageQuantity: pkgQty,
                unitPrice: unitPrice,
                stock: 0,
                isStockTracked: false,
                isActive: true,
                provider: "Comu3"
            });
        }

        console.log(`Parsed ${products.length} products from comu -3.csv`);
        return products;
    } catch (error) {
        console.error("Error parsing COMU3 CSV:", error);
        return [];
    }
}

export async function saveCatalogDraft(products: CatalogProduct[]) {
    try {
        await prisma.catalogDraft.upsert({
            where: { id: 'default' },
            update: {
                data: products as any,
                updatedAt: new Date()
            },
            create: {
                id: 'default',
                data: products as any
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving catalog draft:", error);
        return { success: false, error };
    }
}

export async function getCatalogDraft(): Promise<CatalogProduct[] | null> {
    try {
        const draft = await prisma.catalogDraft.findUnique({
            where: { id: 'default' }
        });
        if (!draft) return null;
        return draft.data as CatalogProduct[];
    } catch (error) {
        console.error("Error getting catalog draft:", error);
        return null;
    }
}

export async function clearCatalogDraft() {
    try {
        await prisma.catalogDraft.delete({
            where: { id: 'default' }
        }).catch(() => {}); // Ignore if doesn't exist
        return { success: true };
    } catch (error) {
        console.error("Error clearing catalog draft:", error);
        return { success: false, error };
    }
}export async function getActiveCatalogProducts(): Promise<CatalogProduct[]> {
    try {
        const products = await prisma.product.findMany({
            where: {
                isArchived: false
            },
            orderBy: { displayOrder: 'asc' }
        });

        return products.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            format: p.format,
            packageType: p.packageType,
            packageQuantity: p.packageQuantity,
            unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
            stock: p.stock,
            isStockTracked: p.isStockTracked,
            isActive: true,
            provider: p.provider
        }));
    } catch (error) {
        console.error("Error fetching active catalog products:", error);
        return [];
    }
}
