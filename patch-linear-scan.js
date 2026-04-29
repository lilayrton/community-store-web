const fs = require('fs');
const path = String.raw`c:\Users\ayrto\.gemini\antigravity\scratch\community-store\src\components\admin\CatalogEditor.tsx`;

try {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/\r\n/g, '\n');

    // Identify the start and end of the OLD handleCopyList function
    // It starts with 'const handleCopyList = () => {' and ends with '};' before 'return ('
    const startMarker = 'const handleCopyList = () => {';
    const endMarker = 'return (';

    // We need to capture the current function body essentially.
    // Given the complexity of the previous failed matches due to slight whitespace/content drift,
    // let's try to locate the start, and then find the 'return (' and cut before it.

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
        console.error("Could not find start of handleCopyList");
        process.exit(1);
    }

    const returnIndex = content.indexOf(endMarker, startIndex);
    if (returnIndex === -1) {
        console.error("Could not find 'return (' after handleCopyList");
        process.exit(1);
    }

    // Now refine the end point. We want to replace everything from startMarker until the last '};' before 'return ('.
    // Looking at the file text, there is likely a '    };' on the line before '    return ('.

    // Let's create the new function body
    const newFunction = `    const handleCopyList = () => {
        const activeProducts = products.filter(p => p.isActive);
        if (activeProducts.length === 0) return;

        let output = "";
        let i = 0;

        while (i < activeProducts.length) {
            const current = activeProducts[i];
            let variants: CatalogProduct[] = [current];
            let lockedPrefix = "";

            // Look ahead to form a group based on adjacent items
            // Must have SAME PRICE to be considered for grouping
            if (i + 1 < activeProducts.length) {
                const next = activeProducts[i + 1];
                
                if (next.price === current.price) {
                    let commonPrefix = "";
                    for (let k = 0; k < Math.min(current.name.length, next.name.length); k++) {
                        if (current.name[k] === next.name[k]) {
                            commonPrefix += current.name[k];
                        } else {
                            break;
                        }
                    }

                    // Snap to the last word boundary
                    const lastSpaceIndex = commonPrefix.lastIndexOf(' ');
                    
                    if (lastSpaceIndex !== -1) {
                            const wordPrefix = commonPrefix.substring(0, lastSpaceIndex + 1);
                            
                            // Threshold: At least 3 chars + space
                            if (wordPrefix.length >= 4) {
                            lockedPrefix = wordPrefix;
                            variants.push(next);

                                // Consume subsequent items ONLY if they match price AND locked prefix
                            let j = i + 2;
                            while (j < activeProducts.length) {
                                const sub = activeProducts[j];
                                if (sub.price === current.price && sub.name.startsWith(lockedPrefix)) {
                                    variants.push(sub);
                                    j++;
                                } else {
                                    break;
                                }
                            }
                            }
                    }
                }
            }

            // Format block
            if (variants.length > 1) {
                const baseName = lockedPrefix.trim();
                const packageInfo = current.packageType && current.packageQuantity 
                    ? \`\${current.packageType} x\${current.packageQuantity}uni\`
                    : "Unidad";
                    
                output += \`🔴 \${baseName}\\n\`;
                output += \` \${packageInfo}\\n\`;
                output += \`$\${current.price}\\n\`;
                if (current.unitPrice) output += \`$\${Math.round(current.unitPrice)} c/u\\n\`;

                variants.forEach(v => {
                    const variantName = v.name.replace(lockedPrefix, "").trim();
                    output += \`🔹 \${variantName || v.name}\\n\`;
                });
                output += "\\n";
                
                // Skip all consumed variants
                i += variants.length;
            } else {
                // Single product
                const packageInfo = current.packageType && current.packageQuantity 
                    ? \`\${current.packageType} x\${current.packageQuantity}uni\`
                    : "Unidad";

                output += \`🔴 \${current.name}\\n\`;
                output += \` \${packageInfo}\\n\`;
                output += \`$\${current.price}\\n\`;
                if (current.unitPrice) output += \`$\${Math.round(current.unitPrice)} c/u\\n\`;
                output += "\\n";

                i++;
            }
        }

        navigator.clipboard.writeText(output);
        alert("¡Lista copiada al portapapeles!");
    };

`;

    // Extract the substring to replace
    // We assume the formatting is roughly standard. The old function ends right before `    return (`.
    // We will replace from `    const handleCopyList =` up to the newline before `    return (`.
    const beforeReturn = content.substring(0, returnIndex);
    const lastClosingBrace = beforeReturn.lastIndexOf('    };');

    if (lastClosingBrace === -1) {
        console.error("Could not find closing brace of old function");
        process.exit(1);
    }

    // Check bounds
    if (lastClosingBrace < startIndex) {
        console.error("Closing brace found before start index? Parsing error.");
        process.exit(1);
    }

    // Construct new content
    const prefix = content.substring(0, startIndex);
    const suffix = content.substring(lastClosingBrace + 6); // +6 to skip "    };\n" roughly

    // Actually, let's be safer.
    // Replace the exact range from `startIndex` to `lastClosingBrace + 6`.
    // But check if `lastClosingBrace` matches indentation expectation.

    const final = prefix + newFunction.trim() + "\n\n" + suffix.trimStart();
    // Note: trimStart() on suffix removes the gap before `return (`. We added `\n\n` for spacing.

    fs.writeFileSync(path, final, 'utf8');
    console.log("Patch applied successfully.");

} catch (err) {
    console.error(err);
    process.exit(1);
}
