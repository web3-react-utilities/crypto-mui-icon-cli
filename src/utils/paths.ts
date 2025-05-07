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

        // Check if the import statement exists
        const importStatement = `import { Icon${token} } from '../tokens/Icon${token}';`;
        if (!content.includes(importStatement)) {
            // Add import statement after the initial imports
            const importPos = content.indexOf("import {");
            if (importPos > -1) {
                const endOfImports = content.indexOf("\n\n", importPos);
                if (endOfImports > -1) {
                    // Extract all existing imports
                    const importSectionText = content.substring(importPos, endOfImports);
                    const importLines = importSectionText.split("\n");

                    // Add the new import
                    importLines.push(importStatement);

                    // Sort imports alphabetically
                    importLines.sort((a, b) => {
                        // Extract the token names from import statements
                        const tokenNameA = a.match(/Icon(\w+)/)?.[1] || "";
                        const tokenNameB = b.match(/Icon(\w+)/)?.[1] || "";
                        return tokenNameA.localeCompare(tokenNameB);
                    });

                    // Replace the import section
                    const newImportSection = importLines.join("\n");
                    content = content.slice(0, importPos) + newImportSection + content.slice(endOfImports);
                }
            }
        }

        // Define mapping entry
        const mappingEntry = `  [TokenName.${token}]: Icon${token},`;

        // Check if mapping already exists
        if (content.includes(mappingEntry)) {
            await fs.writeFile(filePath, content);
            return;
        }

        // Extract the entire mapping object
        const mapRegex = /export const mapNameToIcon[^{]+{([^}]*)}/s;
        const mapMatch = content.match(mapRegex);

        if (mapMatch) {
            // Get the existing mapping entries
            const mapContent = mapMatch[1];
            const entries =
                mapContent.trim().length > 0
                    ? mapContent
                          .split("\n")
                          .map((line) => line.trim())
                          .filter((line) => line.length > 0)
                    : [];

            // Add the new entry
            entries.push(mappingEntry);

            // Sort entries alphabetically by token name
            entries.sort((a, b) => {
                const tokenA = a.match(/\[TokenName\.(\w+)\]/)?.[1] || "";
                const tokenB = b.match(/\[TokenName\.(\w+)\]/)?.[1] || "";
                return tokenA.localeCompare(tokenB);
            });

            // Rebuild the map with sorted entries
            let newMapContent = "export const mapNameToIcon: Record<TokenName, SvgComponent> = {\n";
            if (entries.length > 0) {
                entries.forEach((entry) => {
                    newMapContent += `${entry}\n`;
                });
            } else {
                newMapContent += "  // This will be populated automatically as you add tokens\n";
            }
            newMapContent += "};";

            // Replace the map in the content
            content = content.replace(mapRegex, newMapContent);
        }

        // Write updated content
        await fs.writeFile(filePath, content);

        console.log(chalk.blue(`✓ Updated token mapping for: ${token}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error updating token mapping for: ${token}`), error);
    }
}
