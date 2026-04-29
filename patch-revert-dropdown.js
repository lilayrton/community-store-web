const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/CatalogEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The code block to find (the custom dropdown button logic)
// We look for a unique string in the custom implementation
const targetStringStart = 'onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}';

// If we can't find it, we might have already reverted or the context is wrong
if (!content.includes(targetStringStart)) {
    console.log('Target content not found. Script may have already run or content does not match.');
    process.exit(1);
}

// We need to replace the entire surrounding div.relative block.
// To do this safely, we will use regex to match from the start of the div.relative containing that button
// to the closing of that div.
// However, regex for nested divs is hard.
// Instead, let's look for the specific lines we added.

// We know the structure starts with <div className="relative"> and ends with the closing of the dropdown logic.
// Let's identify the range by unique markers.

const startMarker = '<div className="relative">';
const endMarker = '<div className="w-1/3">'; // The next column (Cant.)

const startIndex = content.lastIndexOf(startMarker, content.indexOf(targetStringStart));
// The end index strictly for the replacement is just before the next column starts
// But we need to be careful about the closing div of the 'relative' container.
const nextColumnIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || nextColumnIndex === -1) {
    console.error('Could not locate start or end markers.');
    process.exit(1);
}

// Now we need to find the specific closing </div> of the "flex-1" div, wait.
// The structure is:
// <div className="flex-1">
//    <label...>...</label>
//    <div className="relative"> ... </div>
// </div>
// <div className="w-1/3">...

// So the "relative" div ends before the closing of "flex-1" div.
// Finding the correct closing div is tricky without a parser.
// But we know the code we pasted.
// It ends with:
//         )}
//     </div>
// </div>
// <div className="w-1/3">

// Let's replace everything from the <div className="relative"> that contains our button
// up to the <div className="w-1/3">, but ensuring we keep the closing </div> of the parent "flex-1" if we consume it?
// No, the "relative" div contains the dropdown.
// Let's try replacing the logic by matching the button content specifically.

const replacement = `<div className="relative">
                                        <select
                                            value={manualProduct.packageType}
                                            onChange={(e) => setManualProduct({ ...manualProduct, packageType: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Unidad">Unidad</option>
                                            <option value="Fraccion">Fracción</option>
                                            <option value="Display">Display</option>
                                            <option value="Bolsa">Bolsa</option>
                                            <option value="Caja">Caja</option>
                                            <option value="Carton">Cartón</option>
                                            <option value="Tira">Tira</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                `;

// Find exactly the block to replace.
// It starts at the unique 'onClick' line's parent div.
// Let's construct a cleaner match.
const blockToReplaceRegex = /<div className="relative">\s*<button\s*onClick={\(\) => setIsPackageDropdownOpen\(!isPackageDropdownOpen\)\}[\s\S]*?<\/div>\s*<\/div>\s*<div className="w-1\/3">/;

// Note: The regex needs to match the </button> ... {isOpen && ... } ... </div> (relative) ... </div> (flex-1) ... <div className="w-1/3">
// Wait, the "relative" div is INSIDE the flex-1 div.
// My regex above matches <div relative> ... </div> ... </div> (flex-1) ... <div w-1/3>
// So it consumes the closing of flex-1.

// My replacement string includes </div> (relative) and </div> (flex-1).
// So this should work.

const matches = content.match(blockToReplaceRegex);
if (!matches) {
    console.error('Regex did not match the custom dropdown block.');
    // Let's print a snippet around the target string to debug
    const idx = content.indexOf(targetStringStart);
    console.log('Snippet around target:', content.substring(idx - 100, idx + 200));
    process.exit(1);
}

const newContent = content.replace(blockToReplaceRegex, replacement + '<div className="w-1/3">');

fs.writeFileSync(filePath, newContent);
console.log('Successfully reverted dropdown logic.');
