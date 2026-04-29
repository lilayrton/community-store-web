import os

path = r"c:\Users\ayrto\.gemini\antigravity\scratch\community-store\src\components\admin\CatalogEditor.tsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# exact block to remove (based on Step 242 view)
to_remove = """                    // Strict threshold to establish a variety group
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
                    }"""

if to_remove not in content:
    print("Error: Target block not found in file content.")
    # Debug: print what IS there around line 217
    lines = content.splitlines()
    if len(lines) > 220:
        print("Context around line 217:")
        for idx in range(215, 222):
            print(f"{idx}: {repr(lines[idx])}")
    exit(1)

new_content_block = """                    // Snap to the last word boundary (space) to ensure we group by whole words (Brands/Sub-brands)
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
                    }"""

final_content = content.replace(to_remove, new_content_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Patch applied successfully.")
