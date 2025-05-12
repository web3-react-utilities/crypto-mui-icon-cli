import fs from "fs-extra";
import chalk from "chalk";
import { specialTokens, specialWallets, specialSystems } from "./specialIcons";

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

        // Check if constant already exists - use a more precise check
        const exactConstantRegex = new RegExp(`export const PNG_${token}: IconUrls`);
        if (exactConstantRegex.test(content)) {
            console.log(chalk.gray(`ℹ️ Image path constant for ${token} already exists, skipping`));
            return;
        }

        // Check if this is a special token that needs different images for light/dark mode
        const isSpecialToken = specialTokens.includes(token);

        // Define the token definition based on whether it's special or not
        let tokenDefinition: string;

        if (isSpecialToken) {
            tokenDefinition = `export const PNG_${token}: IconUrls = {
  lightmode: baseImgUrlToken('${token}-lightmode'),
  darkmode: baseImgUrlToken('${token}-darkmode'),
};`;
            console.log(chalk.cyan(`ℹ️ Using special light/dark mode images for token: ${token}`));
        } else {
            tokenDefinition = `export const PNG_${token}: IconUrls = {
  lightmode: baseImgUrlToken('${token}'),
  darkmode: baseImgUrlToken('${token}'),
};`;
        }

        // Extract all image path constants - use a more inclusive regex to catch tokens with lowercase letters
        const constantRegex = /export const PNG_([A-Za-z0-9_]+): IconUrls = {[\s\S]+?};/g;
        const constants = [];
        let match;

        while ((match = constantRegex.exec(content)) !== null) {
            // Make sure to correctly extract token name without modifying it
            const tokenName = match[1];
            constants.push({
                name: tokenName,
                definition: match[0],
            });
        }

        // Add the new constant to the list
        constants.push({
            name: token,
            definition: tokenDefinition,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Debugging: Log all constants we're about to write
        console.log(chalk.gray(`ℹ️ Adding new token ${token} to constants (Total: ${constants.length})`));        // Find the position where constants start
        const tokenSection = content.indexOf("// Token image paths");
        if (tokenSection > 0) {
            // Find the end of the token section by looking for the next section
            let endOfTokenSection = content.length;
            
            // Look for possible next sections
            const possibleNextSections = [
                "// Wallet image paths", 
                "// System image paths",
                "/**",
                "import"
            ];
            
            for (const nextSection of possibleNextSections) {
                const nextSectionPos = content.indexOf(nextSection, tokenSection + "// Token image paths".length);
                if (nextSectionPos > -1 && nextSectionPos < endOfTokenSection) {
                    endOfTokenSection = nextSectionPos;
                }
            }
            
            // Keep the part before constants, then add the sorted constants with a newline at the end
            const beforeConstants = content.slice(0, tokenSection);
            const afterConstants = content.slice(endOfTokenSection);
            const sortedDefinitions = "// Token image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

            content = beforeConstants + sortedDefinitions + afterConstants;
            await fs.writeFile(filePath, content);
        } else {
            // If we can't find the marker, just append
            content += `\n// Token image paths\n${tokenDefinition}\n`;
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
        const constantName = `PNG_WALLET_${wallet}`;

        // Check if constant already exists - use a more precise check
        const exactConstantRegex = new RegExp(`export const PNG_WALLET_${wallet}: IconUrls`);
        if (exactConstantRegex.test(content)) {
            console.log(chalk.gray(`ℹ️ Image path constant for wallet ${wallet} already exists, skipping`));
            return;
        }

        // Check if this is a special wallet that needs different images for light/dark mode
        const isSpecialWallet = specialWallets.includes(wallet);

        // Define the wallet definition based on whether it's special or not
        let walletDefinition: string;

        if (isSpecialWallet) {
            walletDefinition = `export const PNG_WALLET_${wallet}: IconUrls = {
  lightmode: baseImgUrlWallet('${wallet}-lightmode'),
  darkmode: baseImgUrlWallet('${wallet}-darkmode'),
};`;
            console.log(chalk.cyan(`ℹ️ Using special light/dark mode images for wallet: ${wallet}`));
        } else {
            walletDefinition = `export const PNG_WALLET_${wallet}: IconUrls = {
  lightmode: baseImgUrlWallet('${wallet}'),
  darkmode: baseImgUrlWallet('${wallet}'),
};`;
        }

        // Extract all wallet image path constants - update regex to include all possible characters
        const constantRegex = /export const PNG_WALLET_([A-Za-z0-9_]+): IconUrls = {[\s\S]+?};/g;
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
            name: wallet,
            definition: walletDefinition,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Debugging: Log all constants we're about to write
        console.log(chalk.gray(`ℹ️ Adding new wallet ${wallet} to constants (Total: ${constants.length})`));        // Find where wallet constants section is or should be
        const tokenSection = content.lastIndexOf("// Token image paths");
        const walletSection = content.lastIndexOf("// Wallet image paths");
        const systemSection = content.lastIndexOf("// System image paths");

        if (walletSection > -1) {
            // Find the end of the wallet section by looking for the next section
            let endOfWalletSection = content.length;
            
            // Find next section if any
            if (systemSection > walletSection) {
                endOfWalletSection = systemSection;
            } else {
                // Look for other possible next sections if system section is not after wallet
                const possibleNextSections = [
                    "// Token image paths", // In case token section comes after wallet
                    "/**",
                    "import"
                ];
                
                for (const nextSection of possibleNextSections) {
                    const nextSectionPos = content.indexOf(nextSection, walletSection + "// Wallet image paths".length);
                    if (nextSectionPos > -1 && nextSectionPos < endOfWalletSection) {
                        endOfWalletSection = nextSectionPos;
                    }
                }
            }
            
            // If wallet section exists, replace it
            const beforeSection = content.slice(0, walletSection);
            const afterSection = content.slice(endOfWalletSection);

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
            const walletSectionContent = "\n// Wallet image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

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
        const constantName = `PNG_SYSTEM_${system}`;

        // Check if constant already exists - use a more precise check
        const exactConstantRegex = new RegExp(`export const PNG_SYSTEM_${system}: IconUrls`);
        if (exactConstantRegex.test(content)) {
            console.log(chalk.gray(`ℹ️ Image path constant for system ${system} already exists, skipping`));
            return;
        }

        // Check if this is a special system that needs different images for light/dark mode
        const isSpecialSystem = specialSystems.includes(system);

        // Define the system definition based on whether it's special or not
        let systemDefinition: string;

        if (isSpecialSystem) {
            systemDefinition = `export const PNG_SYSTEM_${system}: IconUrls = {
  lightmode: baseImgUrlSystem('${system}-lightmode'),
  darkmode: baseImgUrlSystem('${system}-darkmode'),
};`;
            console.log(chalk.cyan(`ℹ️ Using special light/dark mode images for system: ${system}`));
        } else {
            systemDefinition = `export const PNG_SYSTEM_${system}: IconUrls = {
  lightmode: baseImgUrlSystem('${system}'),
  darkmode: baseImgUrlSystem('${system}'),
};`;
        }

        // Extract all system image path constants - update regex to include all possible characters
        const constantRegex = /export const PNG_SYSTEM_([A-Za-z0-9_]+): IconUrls = {[\s\S]+?};/g;
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
            name: system,
            definition: systemDefinition,
        });

        // Sort constants alphabetically by name
        constants.sort((a, b) => a.name.localeCompare(b.name));

        // Debugging: Log all constants we're about to write
        console.log(chalk.gray(`ℹ️ Adding new system ${system} to constants (Total: ${constants.length})`));        // Find where system constants section is or should be
        const systemSection = content.lastIndexOf("// System image paths");

        if (systemSection > -1) {
            // Find the end of the system section by looking for the next section or the end of the file
            let endOfSystemSection = content.length;
            
            // Look for possible next sections
            const possibleNextSections = [
                "// Token image paths", 
                "// Wallet image paths",
                "/**",
                "import"
            ];
            
            for (const nextSection of possibleNextSections) {
                const nextSectionPos = content.indexOf(nextSection, systemSection + "// System image paths".length);
                if (nextSectionPos > -1 && nextSectionPos < endOfSystemSection) {
                    endOfSystemSection = nextSectionPos;
                }
            }
            
            // If system section exists, replace it completely
            const beforeSection = content.slice(0, systemSection);
            const afterSection = content.slice(endOfSystemSection);

            const systemSectionContent = "// System image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

            content = beforeSection + systemSectionContent + afterSection;
        } else {
            // Just append at the end
            const systemSectionContent = "\n// System image paths" + constants.map((c) => `\n${c.definition}`).join("\n") + "\n";

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

        // Tạo một RegExp để phù hợp với các import statements hiện có
        const importRegex = /import\s+\{\s*Icon(\w+)\s*\}\s+from\s+['"]\.\.\/tokens\/Icon\w+['"][;\s]*\n?/g;

        // Lấy tất cả các token đã import
        const existingImports = new Set<string>();
        let importMatch;
        while ((importMatch = importRegex.exec(content)) !== null) {
            existingImports.add(importMatch[1]);
        }

        // Thêm token mới nếu chưa tồn tại
        if (!existingImports.has(token)) {
            existingImports.add(token);
        }

        // Sắp xếp tokens theo thứ tự alphabet
        const sortedTokens = Array.from(existingImports).sort();

        // Tạo phần import mới
        const newImportSection = `import { TokenName, SvgComponent } from '../types';
${sortedTokens.map((t) => `import { Icon${t} } from '../tokens/Icon${t}';`).join("\n")}

`;

        // Định vị vị trí nơi phần import nên kết thúc
        const importEndPos = content.indexOf("/**");

        if (importEndPos > 0) {
            // Lấy phần sau import (comment và map object)
            const afterImport = content.slice(importEndPos);

            // Extract the mapNameToIcon object
            const mapRegex = /export\s+const\s+mapNameToIcon[^{]+{([^}]*)}/s;
            const mapMatch = afterImport.match(mapRegex);

            if (mapMatch) {
                // Lấy các entries hiện có
                const mapContent = mapMatch[1];

                // Tạo object mới để chứa tất cả các token mappings
                const tokenMapEntries: Record<string, string> = {};

                // Thêm token hiện có vào object
                for (const t of sortedTokens) {
                    tokenMapEntries[t] = `    [TokenName.${t}]: Icon${t},`;
                }

                // Xây dựng lại map content
                let newMapContent = "export const mapNameToIcon: Record<TokenName, SvgComponent> = {\n";

                if (mapContent.includes("// This will be populated automatically")) {
                    newMapContent += "    // This will be populated automatically as you add tokens\n";
                }

                // Thêm các entries được sắp xếp
                for (const t of sortedTokens) {
                    newMapContent += `${tokenMapEntries[t]}\n`;
                }

                newMapContent += "};";

                // Thay thế the map trong afterImport và loại bỏ hoàn toàn dấu ;;;;
                // Sử dụng regex mới để xử lý dấu chấm phẩy thừa ngay cả khi có dấu xuống dòng
                const cleanAfterImport = afterImport.replace(/};[;\s\n]*(?=\/\*\*|$)/, "};\n");
                const newAfterImport = cleanAfterImport.replace(mapRegex, newMapContent);

                // Tạo nội dung file hoàn chỉnh
                const finalContent = newImportSection + newAfterImport;

                // Loại bỏ bất kỳ dấu ;;;; nào ở cuối file, kể cả khi có dấu xuống dòng
                const cleanFinalContent = finalContent.replace(/};[;\s\n]*$/, "};\n");

                await fs.writeFile(filePath, cleanFinalContent);
                console.log(chalk.blue(`✓ Updated token mapping for: ${token}`));
            } else {
                console.error(chalk.red(`❌ Could not find mapNameToIcon in ${filePath}`));
            }
        } else {
            console.error(chalk.red(`❌ Could not find comment section in ${filePath}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error updating token mapping for: ${token}`), error);
    }
}
