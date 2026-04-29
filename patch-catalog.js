const fs = require('fs');
const path = String.raw`c:\Users\ayrto\.gemini\antigravity\scratch\community-store\src\components\admin\CatalogEditor.tsx`;

try {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/\r\n/g, '\n');

    // Adjusted toRemove block: The empty line probably has NO spaces.
    // I am manually ensuring the empty line is empty string.
    const toRemove = `                    // Strict threshold to establish a variety group
                    if (commonPrefix.length >= 10) {
                        lockedPrefix = commonPrefix;
                        variants.push(next);

                        // Consume subsequent items ONLY if they match the locked prefix
                        let j = i + 2;
                        while (j < group.length) {
                            if (group[j].name.startsWith(lockedPrefix)) {
                                variants.push(group[j]);
                                j++;
                            } else {
                                break;
                            }
                        }
                    }`;

    if (!content.includes(toRemove)) {
        console.error("Target block NOT found!");
        // Try to match ignoring whitespace on empty lines?
        // Let's print the actual chunk from index 7808 (where partial match was found previously)
        // Previous debug said index 7808.
        console.log("Chunk at 7800:");
        console.log(JSON.stringify(content.substring(7800, 8200)));
        process.exit(1);
    }

    const newContentBlock = `                    // Snap to the last word boundary (space) to ensure we group by whole words (Brands/Sub-brands)
                    const lastSpaceIndex = commonPrefix.lastIndexOf(' ');
                    
                    if (lastSpaceIndex !== -1) {
                         const wordPrefix = commonPrefix.substring(0, lastSpaceIndex + 1);
                         
                         // Threshold: At least 3 chars + space (e.g. "OCB ") to be safe
                         if (wordPrefix.length >= 4) {
                            lockedPrefix = wordPrefix;
                            variants.push(next);

                             // Consume subsequent items ONLY if they match the locked prefix
                            let j = i + 2;
                            while (j < group.length) {
                                if (group[j].name.startsWith(lockedPrefix)) {
                                    variants.push(group[j]);
                                    j++;
                                } else {
                                    break;
                                }
                            }
                         }
                    }`;

    const finalContent = content.replace(toRemove, newContentBlock);
    fs.writeFileSync(path, finalContent, 'utf8');
    console.log("Patch applied successfully.");

} catch (err) {
    console.error(err);
    process.exit(1);
}
