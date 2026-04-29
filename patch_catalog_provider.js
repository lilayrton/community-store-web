const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Replace line endings universally for easiest manipulation
    content = content.replace(/\r\n/g, '\n');

    // 1. Update Type
    content = content.replace("isStockTracked: boolean;\n};", "isStockTracked: boolean;\n    provider?: string | null;\n};");
    
    // 2. Update getQuinteroProducts
    content = content.replace("isActive: true, // If we import them for a cycle, we probably want them active\n            isStockTracked: true", "isActive: true, // If we import them for a cycle, we probably want them active\n            isStockTracked: true,\n            provider: p.provider || \"Quintero\"");

    // 3. Update mappings generic
    content = content.replaceAll("isStockTracked: p.isStockTracked || false\n        }));", "isStockTracked: p.isStockTracked || false,\n            provider: p.provider\n        }));");
    content = content.replaceAll("isStockTracked: false\n        }));", "isStockTracked: false,\n            provider: p.provider\n        }));");
    content = content.replaceAll("isStockTracked: (p as any).isStockTracked || false\n        }));", "isStockTracked: (p as any).isStockTracked || false,\n            provider: p.provider\n        }));");
    content = content.replaceAll("isStockTracked: newProduct.isStockTracked\n                });", "isStockTracked: newProduct.isStockTracked,\n                    provider: newProduct.provider\n                });");

    // 4. publishCatalog Update
    content = content.replace("isArchived: !p.isActive, // Active in list = Not Archived\n                        updatedAt: new Date()", "isArchived: !p.isActive, // Active in list = Not Archived\n                        provider: p.provider,\n                        updatedAt: new Date()");

    // 5. publishCatalog Create
    content = content.replace("isStockTracked: p.isStockTracked\n                    }", "isStockTracked: p.isStockTracked,\n                        provider: p.provider\n                    }");

    // 6. createInventoryProducts Create
    content = content.replace("unitPrice: (Number(p.price) || 0) / (Number(p.packageQuantity) || 1),\n                    }", "unitPrice: (Number(p.price) || 0) / (Number(p.packageQuantity) || 1),\n                        provider: p.provider,\n                    }");

    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Patched catalog-actions.ts successfully.");
}

patchFile('src/actions/admin/catalog-actions.ts');
