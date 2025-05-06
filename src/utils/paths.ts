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

    // Write updated content
    content += newConstant;
    await fs.writeFile(filePath, content);

    console.log(chalk.blue(`✓ Added image path for token: ${token}`));
}

/**
 * Add image path constant for a wallet
 */
export async function addWalletImagePathConstant(filePath: string, wallet: string): Promise<void> {
    // Read current content
    let content = await fs.readFile(filePath, "utf-8");

    // Define constant name
    const constantName = `PNG_WALLET_${wallet.toUpperCase()}`;

    // Check if constant already exists
    if (content.includes(constantName)) {
        return;
    }

    // Add constant with light/dark mode URLs
    const newConstant = `
export const ${constantName}: IconUrls = {
  lightmode: baseImgUrlWallet('${wallet.toLowerCase()}'),
  darkmode: baseImgUrlWallet('${wallet.toLowerCase()}'),
};
`;

    // Write updated content
    content += newConstant;
    await fs.writeFile(filePath, content);

    console.log(chalk.blue(`✓ Added image path for wallet: ${wallet}`));
}

/**
 * Add image path constant for a system
 */
export async function addSystemImagePathConstant(filePath: string, system: string): Promise<void> {
    // Read current content
    let content = await fs.readFile(filePath, "utf-8");

    // Define constant name
    const constantName = `PNG_SYSTEM_${system.toUpperCase()}`;

    // Check if constant already exists
    if (content.includes(constantName)) {
        return;
    }

    // Add constant with light/dark mode URLs
    const newConstant = `
export const ${constantName}: IconUrls = {
  lightmode: baseImgUrlSystem('${system.toLowerCase()}'),
  darkmode: baseImgUrlSystem('${system.toLowerCase()}'),
};
`;

    // Write updated content
    content += newConstant;
    await fs.writeFile(filePath, content);

    console.log(chalk.blue(`✓ Added image path for system: ${system}`));
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
                content = content.slice(0, endOfImports) + "\n" + importStatement + content.slice(endOfImports);
            }
        }
    }

    // Define mapping entry
    const mappingEntry = `  [TokenName.${token}]: Icon${token},`;

    // Check if mapping already exists
    if (content.includes(mappingEntry)) {
        return;
    }

    // Add mapping entry
    const insertPos = content.lastIndexOf("};");
    if (insertPos > -1) {
        content = content.slice(0, insertPos) + mappingEntry + "\n" + content.slice(insertPos);
    }

    // Write updated content
    await fs.writeFile(filePath, content);

    console.log(chalk.blue(`✓ Updated token mapping for: ${token}`));
}
