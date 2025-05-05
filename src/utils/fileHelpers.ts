import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { ExportOptions } from "../types";

/**
 * Create base structure for crypto icons
 */
export async function createBaseStructure(targetDir: string): Promise<void> {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);

    // Create subdirectories
    const dirs = ["tokens", "wallets", "systems", "utils", "types", "constants"];
    for (const dir of dirs) {
        await fs.ensureDir(path.join(targetDir, dir));
        console.log(chalk.green(`✓ Created directory: ${path.join(targetDir, dir)}`));
    }

    // Create base files
    await createBaseTypes(targetDir);
    await createBaseUtils(targetDir);
    await createIndexExports(targetDir);

    console.log(chalk.green("✓ Created base files"));
}

/**
 * Create base types file
 */
async function createBaseTypes(targetDir: string): Promise<void> {
    const typesDir = path.join(targetDir, "types");

    // Create TokenName.ts
    const tokenNameContent = `export enum TokenName {
  // This will be populated automatically as you add tokens
}
`;
    await fs.writeFile(path.join(typesDir, "TokenName.ts"), tokenNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "TokenName.ts")}`));

    // Create WalletName.ts
    const walletNameContent = `export enum WalletName {
  // This will be populated automatically as you add wallets
}
`;
    await fs.writeFile(path.join(typesDir, "WalletName.ts"), walletNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "WalletName.ts")}`));

    // Create SystemName.ts
    const systemNameContent = `export enum SystemName {
  // This will be populated automatically as you add systems
}
`;
    await fs.writeFile(path.join(typesDir, "SystemName.ts"), systemNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "SystemName.ts")}`));

    // Create index.ts that exports all types
    const indexContent = `import { SvgIconProps } from '@mui/material/SvgIcon';

export type SvgComponent = React.FC<SvgIconProps>;

export interface AddCommandOptions {
  token?: string[];
  wallet?: string[];
  system?: string[];
  dir?: string;
}

export interface ExportOptions {
  tokens: string[];
  wallets: string[];
  systems: string[];
}

export interface IconUrls {
  lightmode: string;
  darkmode: string;
}

export { TokenName } from './TokenName';
export { WalletName } from './WalletName';
export { SystemName } from './SystemName';
`;

    await fs.writeFile(path.join(typesDir, "index.ts"), indexContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "index.ts")}`));

    // Create iconMappings.ts in constants directory
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    const iconMappingsContent = `import { TokenName, SvgComponent } from '../types';

/**
 * Maps token names to their respective icon components
 * This file is auto-generated and will be updated by the CLI
 */
export const mapNameToIcon: Record<TokenName, SvgComponent> = {
  // This will be populated automatically as you add tokens
};
`;

    await fs.writeFile(path.join(constantsDir, "iconMappings.ts"), iconMappingsContent);
    console.log(chalk.green(`✓ Created file: ${path.join(constantsDir, "iconMappings.ts")}`));
}

/**
 * Create base utils file
 */
async function createBaseUtils(targetDir: string): Promise<void> {
    const utilsContent = `import { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

export const withTitle = (Component: React.FC<SvgIconProps>, title: string): React.FC<SvgIconProps> => {
  return (props) => <Component {...props} titleAccess={title} />;
};
`;

    await fs.writeFile(path.join(targetDir, "utils", "iconHelpers.ts"), utilsContent);
}

/**
 * Create index export files
 */
async function createIndexExports(targetDir: string): Promise<void> {
    // Main index file
    const mainIndexContent = `export * from './tokens';
export * from './wallets';
export * from './systems';
export * from './types';
`;
    await fs.writeFile(path.join(targetDir, "index.ts"), mainIndexContent);

    // Category index files
    const categories = ["tokens", "wallets", "systems"];
    for (const category of categories) {
        await fs.writeFile(path.join(targetDir, category, "index.ts"), "// Exports will be added automatically\n");
    }
}

/**
 * Copy token templates
 */
export async function copyTokenTemplates(tokens: string[], targetDir: string): Promise<void> {
    const tokensDir = path.join(targetDir, "tokens");
    await fs.ensureDir(tokensDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    // Ensure iconMappings file exists
    await ensureIconMappingsFile(path.join(constantsDir, "iconMappings.ts"));

    for (const token of tokens) {
        const templatePath = path.join(__dirname, "..", "templates", "tokens", "TokenTemplate.tsx");
        const destPath = path.join(tokensDir, `Icon${token}.tsx`);

        // Skip if the file already exists
        if (await fs.pathExists(destPath)) {
            console.log(chalk.yellow(`⚠️ Token ${token} already exists, skipping...`));
            continue;
        }

        try {
            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createTokenTemplate();
            }

            // Read template and replace placeholders
            let templateContent = await fs.readFile(templatePath, "utf-8");
            templateContent = templateContent.replace(/{{TOKEN_NAME}}/g, token);

            // Write the file
            await fs.writeFile(destPath, templateContent);

            // Update image paths
            await addImagePathConstant(path.join(constantsDir, "imagePaths.ts"), token);

            // Update token mapping
            await updateTokenMapping(path.join(constantsDir, "iconMappings.ts"), token);

            console.log(chalk.green(`✓ Created token icon: ${token}`));
        } catch (error) {
            console.error(chalk.red(`Error creating token ${token}:`), error);
        }
    }
}

/**
 * Copy wallet templates
 */
export async function copyWalletTemplates(wallets: string[], targetDir: string): Promise<void> {
    const walletsDir = path.join(targetDir, "wallets");
    await fs.ensureDir(walletsDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    for (const wallet of wallets) {
        const templatePath = path.join(__dirname, "..", "templates", "wallets", "WalletTemplate.tsx");
        const destPath = path.join(walletsDir, `Icon${wallet}.tsx`);

        // Skip if the file already exists
        if (await fs.pathExists(destPath)) {
            console.log(chalk.yellow(`⚠️ Wallet ${wallet} already exists, skipping...`));
            continue;
        }

        try {
            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createWalletTemplate();
            }

            // Read template and replace placeholders
            let templateContent = await fs.readFile(templatePath, "utf-8");
            templateContent = templateContent.replace(/{{WALLET_NAME}}/g, wallet);

            // Write the file
            await fs.writeFile(destPath, templateContent);

            // Update image paths
            await addWalletImagePathConstant(path.join(constantsDir, "imagePaths.ts"), wallet);

            console.log(chalk.green(`✓ Created wallet icon: ${wallet}`));
        } catch (error) {
            console.error(chalk.red(`Error creating wallet ${wallet}:`), error);
        }
    }
}

/**
 * Copy system templates
 */
export async function copySystemTemplates(systems: string[], targetDir: string): Promise<void> {
    const systemsDir = path.join(targetDir, "systems");
    await fs.ensureDir(systemsDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    for (const system of systems) {
        const templatePath = path.join(__dirname, "..", "templates", "systems", "SystemTemplate.tsx");
        const destPath = path.join(systemsDir, `Icon${system}.tsx`);

        // Skip if the file already exists
        if (await fs.pathExists(destPath)) {
            console.log(chalk.yellow(`⚠️ System ${system} already exists, skipping...`));
            continue;
        }

        try {
            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createSystemTemplate();
            }

            // Read template and replace placeholders
            let templateContent = await fs.readFile(templatePath, "utf-8");
            templateContent = templateContent.replace(/{{SYSTEM_NAME}}/g, system);

            // Write the file
            await fs.writeFile(destPath, templateContent);

            // Update image paths
            await addSystemImagePathConstant(path.join(constantsDir, "imagePaths.ts"), system);

            console.log(chalk.green(`✓ Created system icon: ${system}`));
        } catch (error) {
            console.error(chalk.red(`Error creating system ${system}:`), error);
        }
    }
}

/**
 * Update export files
 */
export async function updateExports(targetDir: string, options: ExportOptions): Promise<void> {
    const { tokens, wallets, systems } = options;

    if (tokens.length > 0) {
        await updateTokenExports(path.join(targetDir, "tokens", "index.ts"), tokens);
        await updateTokenEnum(path.join(targetDir, "types", "TokenName.ts"), tokens);
    }

    if (wallets.length > 0) {
        await updateWalletExports(path.join(targetDir, "wallets", "index.ts"), wallets);
        await updateWalletEnum(path.join(targetDir, "types", "WalletName.ts"), wallets);
    }

    if (systems.length > 0) {
        await updateSystemExports(path.join(targetDir, "systems", "index.ts"), systems);
        await updateSystemEnum(path.join(targetDir, "types", "SystemName.ts"), systems);
    }
}

/**
 * Update token exports
 */
async function updateTokenExports(filePath: string, tokens: string[]): Promise<void> {
    let content = "";

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");
    }

    // Add new export statements
    for (const token of tokens) {
        const exportStatement = `export { Icon${token} } from './Icon${token}';\n`;
        if (!content.includes(exportStatement)) {
            content += exportStatement;
        }
    }

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update wallet exports
 */
async function updateWalletExports(filePath: string, wallets: string[]): Promise<void> {
    let content = "";

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");
    }

    // Add new export statements
    for (const wallet of wallets) {
        const exportStatement = `export { Icon${wallet} } from './Icon${wallet}';\n`;
        if (!content.includes(exportStatement)) {
            content += exportStatement;
        }
    }

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update system exports
 */
async function updateSystemExports(filePath: string, systems: string[]): Promise<void> {
    let content = "";

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");
    }

    // Add new export statements
    for (const system of systems) {
        const exportStatement = `export { Icon${system} } from './Icon${system}';\n`;
        if (!content.includes(exportStatement)) {
            content += exportStatement;
        }
    }

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update token enum
 */
async function updateTokenEnum(filePath: string, tokens: string[]): Promise<void> {
    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
        console.log(chalk.yellow(`⚠️ Types file does not exist: ${filePath}`));
        return;
    }

    // Read current content
    let content = await fs.readFile(filePath, "utf-8");

    // Find TokenName enum
    const tokenEnumRegex = /export enum TokenName \{[^}]*\}/s;
    const match = content.match(tokenEnumRegex);

    if (match) {
        // Extract existing enum
        const existingEnum = match[0];

        // Get existing tokens
        const existingTokens = existingEnum.match(/\s+\w+\s*=\s*['"](\w+)['"]/g) || [];
        const existingTokenSet = new Set(
            existingTokens.map((t) => {
                const match = t.match(/\s+\w+\s*=\s*['"](\w+)['"]/);
                return match ? match[1] : "";
            })
        );

        // Prepare array to hold all tokens
        const allTokens = [...existingTokenSet];

        // Track new tokens
        const newTokens = [];

        // Add new tokens if they don't already exist
        for (const token of tokens) {
            if (!existingTokenSet.has(token)) {
                allTokens.push(token);
                newTokens.push(token);
            }
        }

        // Sort tokens alphabetically
        allTokens.sort();

        // Rebuild the enum with all tokens
        let newEnum = "export enum TokenName {\n";

        for (const token of allTokens) {
            newEnum += `  ${token} = '${token}',\n`;
        }

        newEnum += "}";

        // Replace enum in content
        content = content.replace(tokenEnumRegex, newEnum);

        // Write updated content
        await fs.writeFile(filePath, content);

        // Log the new tokens that were added
        if (newTokens.length > 0) {
            console.log(chalk.blue(`✓ Updated TokenName enum with: ${newTokens.join(", ")}`));
        } else {
            console.log(chalk.gray(`ℹ️ TokenName enum already contains all tokens, no updates needed`));
        }
    } else {
        // If no enum found, create a new one with the provided tokens
        console.log(chalk.yellow(`⚠️ Could not find TokenName enum in ${filePath}, creating new one`));

        // Sort the tokens alphabetically
        const sortedTokens = [...tokens].sort();

        // Create a new enum
        let newEnum = "export enum TokenName {\n";
        for (const token of sortedTokens) {
            newEnum += `  ${token} = '${token}',\n`;
        }
        newEnum += "}\n";

        // Write the new enum
        await fs.writeFile(filePath, newEnum);

        console.log(chalk.blue(`✓ Created TokenName enum with: ${tokens.join(", ")}`));
    }
}

/**
 * Update wallet enum
 */
async function updateWalletEnum(filePath: string, wallets: string[]): Promise<void> {
    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
        console.log(chalk.yellow(`⚠️ Types file does not exist: ${filePath}`));
        return;
    }

    // Read current content
    let content = await fs.readFile(filePath, "utf-8");

    // Find WalletName enum
    const walletEnumRegex = /export enum WalletName \{[^}]*\}/s;
    const match = content.match(walletEnumRegex);

    if (match) {
        // Extract existing enum
        const existingEnum = match[0];

        // Get existing wallets
        const existingWallets = existingEnum.match(/\s+\w+\s*=\s*['"](\w+)['"]/g) || [];
        const existingWalletSet = new Set(
            existingWallets.map((w) => {
                const match = w.match(/\s+\w+\s*=\s*['"](\w+)['"]/);
                return match ? match[1] : "";
            })
        );

        // Prepare array to hold all wallets
        const allWallets = [...existingWalletSet];

        // Track new wallets
        const newWallets = [];

        // Add new wallets if they don't already exist
        for (const wallet of wallets) {
            if (!existingWalletSet.has(wallet)) {
                allWallets.push(wallet);
                newWallets.push(wallet);
            }
        }

        // Sort wallets alphabetically
        allWallets.sort();

        // Rebuild the enum with all wallets
        let newEnum = "export enum WalletName {\n";

        for (const wallet of allWallets) {
            newEnum += `  ${wallet} = '${wallet}',\n`;
        }

        newEnum += "}";

        // Replace enum in content
        content = content.replace(walletEnumRegex, newEnum);

        // Write updated content
        await fs.writeFile(filePath, content);

        // Log the new wallets that were added
        if (newWallets.length > 0) {
            console.log(chalk.blue(`✓ Updated WalletName enum with: ${newWallets.join(", ")}`));
        } else {
            console.log(chalk.gray(`ℹ️ WalletName enum already contains all wallets, no updates needed`));
        }
    } else {
        // If no enum found, create a new one with the provided wallets
        console.log(chalk.yellow(`⚠️ Could not find WalletName enum in ${filePath}, creating new one`));

        // Sort the wallets alphabetically
        const sortedWallets = [...wallets].sort();

        // Create a new enum
        let newEnum = "export enum WalletName {\n";
        for (const wallet of sortedWallets) {
            newEnum += `  ${wallet} = '${wallet}',\n`;
        }
        newEnum += "}\n";

        // Write the new enum
        await fs.writeFile(filePath, newEnum);

        console.log(chalk.blue(`✓ Created WalletName enum with: ${wallets.join(", ")}`));
    }
}

/**
 * Update system enum
 */
async function updateSystemEnum(filePath: string, systems: string[]): Promise<void> {
    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
        console.log(chalk.yellow(`⚠️ Types file does not exist: ${filePath}`));
        return;
    }

    // Read current content
    let content = await fs.readFile(filePath, "utf-8");

    // Find SystemName enum
    const systemEnumRegex = /export enum SystemName \{[^}]*\}/s;
    const match = content.match(systemEnumRegex);

    if (match) {
        // Extract existing enum
        const existingEnum = match[0];
        let newEnum = "export enum SystemName {\n";

        // Get existing systems
        const existingSystems = existingEnum.match(/\s+\w+\s*=\s*['"](\w+)['"]/g) || [];
        const existingSystemSet = new Set(
            existingSystems.map((s) => {
                const match = s.match(/\s+\w+\s*=\s*['"](\w+)['"]/);
                return match ? match[1] : "";
            })
        );

        // Add new systems
        for (const system of systems) {
            if (!existingSystemSet.has(system)) {
                newEnum += `  ${system} = '${system}',\n`;
            }
        }

        // Add existing systems
        for (const systemLine of existingSystems) {
            newEnum += `${systemLine},\n`;
        }

        newEnum += "}";

        // Replace enum in content
        content = content.replace(systemEnumRegex, newEnum);

        // Write updated content
        await fs.writeFile(filePath, content);

        console.log(chalk.blue(`✓ Updated SystemName enum with: ${systems.join(", ")}`));
    } else {
        console.log(chalk.yellow(`⚠️ Could not find SystemName enum in ${filePath}`));
    }
}

/**
 * Ensure image paths file exists
 */
async function ensureImagePathsFile(filePath: string): Promise<void> {
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
 * Add image path constant for token
 */
async function addImagePathConstant(filePath: string, token: string): Promise<void> {
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
 * Add image path constant for wallet
 */
async function addWalletImagePathConstant(filePath: string, wallet: string): Promise<void> {
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
 * Add image path constant for system
 */
async function addSystemImagePathConstant(filePath: string, system: string): Promise<void> {
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
 * Create token template file
 */
async function createTokenTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "tokens");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_{{TOKEN_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{TOKEN_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{TOKEN_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_{{TOKEN_NAME}}.darkmode : PNG_{{TOKEN_NAME}}.lightmode} 
        xlinkTitle={'{{TOKEN_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "TokenTemplate.tsx"), templateContent);
}

/**
 * Create wallet template file
 */
async function createWalletTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "wallets");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_WALLET_{{WALLET_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{WALLET_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{WALLET_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_WALLET_{{WALLET_NAME}}.darkmode : PNG_WALLET_{{WALLET_NAME}}.lightmode} 
        xlinkTitle={'{{WALLET_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "WalletTemplate.tsx"), templateContent);
}

/**
 * Create system template file
 */
async function createSystemTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "systems");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_SYSTEM_{{SYSTEM_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{SYSTEM_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{SYSTEM_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_SYSTEM_{{SYSTEM_NAME}}.darkmode : PNG_SYSTEM_{{SYSTEM_NAME}}.lightmode} 
        xlinkTitle={'{{SYSTEM_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "SystemTemplate.tsx"), templateContent);
}

/**
 * Ensure icon mappings file exists
 */
async function ensureIconMappingsFile(filePath: string): Promise<void> {
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
 * Update token mapping
 */
async function updateTokenMapping(filePath: string, token: string): Promise<void> {
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
