import fs from "fs-extra";
import chalk from "chalk";

/**
 * Ensure the image paths file exists or create it
 */
export async function ensureImagePathsFile(filePath: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        const content = `// Image paths for tokens, wallets and systems
// This file is auto-generated and will be updated by the CLI

import { IconUrls } from '../types';

export const baseImgUrl = 'https://firebasestorage.googleapis.com/v0/b/crypto-images';
export const baseImgUrlToken = (nameToken: string) => \`\${baseImgUrl}-token/o/\${nameToken}.png?alt=media\`;
export const baseImgUrlSystem = (nameSystem: string) => \`\${baseImgUrl}-system/o/\${nameSystem}.png?alt=media\`;
export const baseImgUrlWallet = (nameWallet: string) => \`\${baseImgUrl}-wallet/o/\${nameWallet}.png?alt=media\`;

// Token image paths
`;
        await fs.writeFile(filePath, content);
    } else {
        // Ensure the base URL functions are defined
        let content = await fs.readFile(filePath, "utf-8");
        if (!content.includes("baseImgUrl =")) {
            // Add imports if not present
            if (!content.includes("import { IconUrls }")) {
                content = `import { IconUrls } from '../types';\n\n${content}`;
            }

            // Add base URL functions
            const baseUrlDefs = `
export const baseImgUrl = 'https://firebasestorage.googleapis.com/v0/b/crypto-images';
export const baseImgUrlToken = (nameToken: string) => \`\${baseImgUrl}-token/o/\${nameToken}.png?alt=media\`;
export const baseImgUrlSystem = (nameSystem: string) => \`\${baseImgUrl}-system/o/\${nameSystem}.png?alt=media\`;
export const baseImgUrlWallet = (nameWallet: string) => \`\${baseImgUrl}-wallet/o/\${nameWallet}.png?alt=media\`;
`;

            // Find a good position to insert the definitions
            const insertPos = content.indexOf("// Token image paths");
            if (insertPos > 0) {
                content = content.slice(0, insertPos) + baseUrlDefs + content.slice(insertPos);
            } else {
                content += baseUrlDefs;
            }

            await fs.writeFile(filePath, content);
        }
    }
}

/**
 * Add image path constant for a token
 */
export async function addImagePathConstant(filePath: string, token: string): Promise<void> {
    try {
        // Read current content
        let content = await fs.readFile(filePath, "utf-8");

        // Define constant name
        const constantName = `PNG_${token}`;

        // Check if constant already exists
        if (content.includes(constantName)) {
            return;
        }

        // Add constant with light/dark mode URLs
        const newConstant = `
export const ${constantName}: IconUrls = {
  lightmode: baseImgUrlToken('${token}'),
  darkmode: baseImgUrlToken('${token}'),
};
`;

        // Extract all image path constants
        const constantRegex = /export const PNG_([A-Z0-9]+): IconUrls = {[\s\S]+?};/g;
        const constants = [];
        let match;

        while ((match = constantRegex.exec(content)) !== null) {
            constants.push({
                name: match[1],
                definition: match[0],
            });
        }

        // Add the new constant to the list
        constants.push({
            name: token,
            definition: `export const PNG_${token}: IconUrls = {
  lightmode: baseImgUrlToken('${token}'),
  darkmode: baseImgUrlToken('${token}'),
};`,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Find the position where constants start
        const insertPos = content.indexOf("// Token image paths");
        if (insertPos > 0) {
            // Keep the part before constants, then add the sorted constants
            const beforeConstants = content.slice(0, insertPos + "// Token image paths".length);
            const sortedDefinitions = constants.map((c) => `\n${c.definition}`).join("\n");

            content = beforeConstants + sortedDefinitions;
            await fs.writeFile(filePath, content);
        } else {
            // If we can't find the marker, just append
            content += newConstant;
            await fs.writeFile(filePath, content);
        }

        console.log(chalk.blue(`✓ Added image path for token: ${token}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error adding image path for token: ${token}`), error);
    }
}

/**
 * Add image path constant for a wallet
 */
export async function addWalletImagePathConstant(filePath: string, wallet: string): Promise<void> {
    try {
        // Read current content
        let content = await fs.readFile(filePath, "utf-8");

        // Define constant name
        const constantName = `PNG_WALLET_${wallet.toUpperCase()}`;

        // Check if constant already exists
        if (content.includes(constantName)) {
            return;
        }

        // Extract all wallet image path constants
        const constantRegex = /export const PNG_WALLET_([A-Z0-9]+): IconUrls = {[\s\S]+?};/g;
        const constants = [];
        let match;

        while ((match = constantRegex.exec(content)) !== null) {
            constants.push({
                name: match[1],
                definition: match[0],
            });
        }

        // Add the new constant to the list
        constants.push({
            name: wallet.toUpperCase(),
            definition: `export const PNG_WALLET_${wallet.toUpperCase()}: IconUrls = {
  lightmode: baseImgUrlWallet('${wallet.toLowerCase()}'),
  darkmode: baseImgUrlWallet('${wallet.toLowerCase()}'),
};`,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Find where wallet constants section is or should be
        const tokenSection = content.lastIndexOf("// Token image paths");
        const walletSection = content.lastIndexOf("// Wallet image paths");
        const systemSection = content.lastIndexOf("// System image paths");

        let insertPos;

        if (walletSection > -1) {
            // If wallet section exists, replace it
            const nextSection = systemSection > walletSection ? systemSection : content.length;
            const beforeSection = content.slice(0, walletSection);
            const afterSection = content.slice(nextSection);

            const walletSectionContent = "// Wallet image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

            content = beforeSection + walletSectionContent + afterSection;
        } else if (systemSection > -1) {
            // If system section exists but no wallet section, insert before system
            const beforeSection = content.slice(0, systemSection);
            const afterSection = content.slice(systemSection);

            const walletSectionContent = "\n// Wallet image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

            content = beforeSection + walletSectionContent + afterSection;
        } else {
            // Just append at the end
            const walletSectionContent = "\n// Wallet image paths" + constants.map((c) => `\n${c.definition}`).join("\n");

            content += walletSectionContent;
        }

        await fs.writeFile(filePath, content);
        console.log(chalk.blue(`✓ Added image path for wallet: ${wallet}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error adding image path for wallet: ${wallet}`), error);
    }
}

/**
 * Add image path constant for a system
 */
export async function addSystemImagePathConstant(filePath: string, system: string): Promise<void> {
    try {
        // Read current content
        let content = await fs.readFile(filePath, "utf-8");

        // Define constant name
        const constantName = `PNG_SYSTEM_${system.toUpperCase()}`;

        // Check if constant already exists
        if (content.includes(constantName)) {
            return;
        }

        // Extract all system image path constants
        const constantRegex = /export const PNG_SYSTEM_([A-Z0-9]+): IconUrls = {[\s\S]+?};/g;
        const constants = [];
        let match;

        while ((match = constantRegex.exec(content)) !== null) {
            constants.push({
                name: match[1],
                definition: match[0],
            });
        }

        // Add the new constant to the list
        constants.push({
            name: system.toUpperCase(),
            definition: `export const PNG_SYSTEM_${system.toUpperCase()}: IconUrls = {
  lightmode: baseImgUrlSystem('${system.toLowerCase()}'),
  darkmode: baseImgUrlSystem('${system.toLowerCase()}'),
};`,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Find where system constants section is or should be
        const systemSection = content.lastIndexOf("// System image paths");

        if (systemSection > -1) {
            // If system section exists, replace it
            const beforeSection = content.slice(0, systemSection);
            const afterSection = content.slice(systemSection + "// System image paths".length);

            const systemSectionContent = "// System image paths" + constants.map((c) => `\n${c.definition}`).join("\n");

            content = beforeSection + systemSectionContent + afterSection;
        } else {
            // Just append at the end
            const systemSectionContent = "\n// System image paths" + constants.map((c) => `\n${c.definition}`).join("\n");

            content += systemSectionContent;
        }

        await fs.writeFile(filePath, content);
        console.log(chalk.blue(`✓ Added image path for system: ${system}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error adding image path for system: ${system}`), error);
    }
}

/**
 * Ensure the icon mappings file exists or create it
 */
export async function ensureIconMappingsFile(filePath: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        const content = `import { TokenName, SvgComponent } from '../types';

/**
 * Maps token names to their respective icon components
 * This file is auto-generated and will be updated by the CLI
 */
export const mapNameToIcon: Record<TokenName, SvgComponent> = {
  // This will be populated automatically as you add tokens
};
`;
        await fs.writeFile(filePath, content);
    }
}

/**
 * Update token mapping in icon mappings file
 */
export async function updateTokenMapping(filePath: string, token: string): Promise<void> {
    try {
        // Read current content
        let content = await fs.readFile(filePath, "utf-8");

        // Handle import statements
        const importRegex = /import\s+{[^}]*}\s+from\s+['"][^'"]+['"]/g;
        const importSection = content.match(/(import\s+{[^}]*}\s+from\s+['"][^'"]+['"][\s\n]*)+/);

        // Extract all imports
        const imports = [];
        if (importSection) {
            const importSectionText = importSection[0];
            const importLines = importSectionText.match(importRegex) || [];

            // Get existing imports
            for (const importLine of importLines) {
                imports.push(importLine);
            }
        }

        // Add new import if it doesn't exist
        const tokenImport = `import { Icon${token} } from '../tokens/Icon${token}'`;
        if (!imports.some((imp) => imp.includes(`Icon${token}`))) {
            imports.push(tokenImport);
        }

        // Sort imports alphabetically
        imports.sort((a, b) => {
            const tokenA = a.match(/Icon(\w+)/)?.[1] || "";
            const tokenB = b.match(/Icon(\w+)/)?.[1] || "";
            return tokenA.localeCompare(tokenB);
        });

        // Create new import section
        const newImportSection = imports.join(";\n") + ";\n\n";

        // Handle the mapNameToIcon section
        const mapRegex = /export\s+const\s+mapNameToIcon[^{]+{([^}]*)}/s;
        const mapMatch = content.match(mapRegex);

        if (mapMatch) {
            // Get existing entries
            const mapContent = mapMatch[1];
            const entryRegex = /\[\s*TokenName\.(\w+)\s*\]\s*:\s*Icon\w+\s*,?/g;
            const entries: Record<string, string> = {};
            let entryMatch;

            while ((entryMatch = entryRegex.exec(mapContent)) !== null) {
                const tokenName = entryMatch[1];
                entries[tokenName] = tokenName;
            }

            // Add new entry if not exists
            if (!entries[token]) {
                entries[token] = token;
            }

            // Sort entries alphabetically
            const sortedTokens = Object.keys(entries).sort();

            // Rebuild the map
            let newMapContent = "export const mapNameToIcon: Record<TokenName, SvgComponent> = {\n";

            if (sortedTokens.length > 0) {
                if (mapContent.includes("// This will be populated automatically")) {
                    newMapContent += "    // This will be populated automatically as you add tokens\n";
                }

                for (const t of sortedTokens) {
                    newMapContent += `    [TokenName.${t}]: Icon${t},\n`;
                }
            } else {
                newMapContent += "    // This will be populated automatically as you add tokens\n";
            }

            newMapContent += "};";

            // Replace the import section and map content
            let newContent = content;

            // Replace import section if it exists, otherwise add at the beginning
            if (importSection) {
                newContent = newContent.replace(importSection[0], newImportSection);
            } else {
                newContent = newImportSection + newContent;
            }

            // Replace map section
            newContent = newContent.replace(mapRegex, newMapContent);

            // Write updated content
            await fs.writeFile(filePath, newContent);
            console.log(chalk.blue(`✓ Updated token mapping for: ${token}`));
        } else {
            console.error(chalk.red(`❌ Could not find mapNameToIcon in ${filePath}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error updating token mapping for: ${token}`), error);
    }
}
