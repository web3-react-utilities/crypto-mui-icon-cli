import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

/**
 * Update export files for tokens, wallets, and systems
 */
export async function updateExports(targetDir: string, options: { tokens: string[]; wallets: string[]; systems: string[] }): Promise<void> {
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
 * Update token exports in the index.ts file
 */
export async function updateTokenExports(filePath: string, tokens: string[]): Promise<void> {
    let content = "";
    let existingExports = new Set<string>();

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");

        // Extract existing exports to maintain them
        const exportLines = content.match(/export \{ Icon\w+ \} from '\.\/(Icon\w+)';\n/g) || [];
        exportLines.forEach((line) => {
            existingExports.add(line);
        });
    }

    // Add new export statements
    for (const token of tokens) {
        const exportStatement = `export { Icon${token} } from './Icon${token}';\n`;
        existingExports.add(exportStatement);
    }

    // Convert to array, sort alphabetically, and join
    const sortedExports = Array.from(existingExports).sort();
    content = sortedExports.join("");

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update wallet exports in the index.ts file
 */
export async function updateWalletExports(filePath: string, wallets: string[]): Promise<void> {
    let content = "";
    let existingExports = new Set<string>();

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");

        // Extract existing exports to maintain them
        const exportLines = content.match(/export \{ Icon\w+ \} from '\.\/(Icon\w+)';\n/g) || [];
        exportLines.forEach((line) => {
            existingExports.add(line);
        });
    }

    // Add new export statements
    for (const wallet of wallets) {
        const exportStatement = `export { Icon${wallet} } from './Icon${wallet}';\n`;
        existingExports.add(exportStatement);
    }

    // Convert to array, sort alphabetically, and join
    const sortedExports = Array.from(existingExports).sort();
    content = sortedExports.join("");

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update system exports in the index.ts file
 */
export async function updateSystemExports(filePath: string, systems: string[]): Promise<void> {
    let content = "";
    let existingExports = new Set<string>();

    // Check if file exists and read current content
    if (await fs.pathExists(filePath)) {
        content = await fs.readFile(filePath, "utf-8");

        // Extract existing exports to maintain them
        const exportLines = content.match(/export \{ Icon\w+ \} from '\.\/(Icon\w+)';\n/g) || [];
        exportLines.forEach((line) => {
            existingExports.add(line);
        });
    }

    // Add new export statements
    for (const system of systems) {
        const exportStatement = `export { Icon${system} } from './Icon${system}';\n`;
        existingExports.add(exportStatement);
    }

    // Convert to array, sort alphabetically, and join
    const sortedExports = Array.from(existingExports).sort();
    content = sortedExports.join("");

    // Write updated content
    await fs.writeFile(filePath, content);
}

/**
 * Update the TokenName enum with new tokens
 */
export async function updateTokenEnum(filePath: string, tokens: string[]): Promise<void> {
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
 * Update the WalletName enum with new wallets
 */
export async function updateWalletEnum(filePath: string, wallets: string[]): Promise<void> {
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
 * Update the SystemName enum with new systems
 */
export async function updateSystemEnum(filePath: string, systems: string[]): Promise<void> {
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

        // Get existing systems
        const existingSystems = existingEnum.match(/\s+\w+\s*=\s*['"](\w+)['"]/g) || [];
        const existingSystemSet = new Set(
            existingSystems.map((s) => {
                const match = s.match(/\s+\w+\s*=\s*['"](\w+)['"]/);
                return match ? match[1] : "";
            })
        );

        // Prepare array to hold all systems
        const allSystems = [...existingSystemSet];

        // Track new systems
        const newSystems = [];

        // Add new systems if they don't already exist
        for (const system of systems) {
            if (!existingSystemSet.has(system)) {
                allSystems.push(system);
                newSystems.push(system);
            }
        }

        // Sort systems alphabetically
        allSystems.sort();

        // Rebuild the enum with all systems
        let newEnum = "export enum SystemName {\n";

        for (const system of allSystems) {
            newEnum += `  ${system} = '${system}',\n`;
        }

        newEnum += "}";

        // Replace enum in content
        content = content.replace(systemEnumRegex, newEnum);

        // Write updated content
        await fs.writeFile(filePath, content);

        // Log the new systems that were added
        if (newSystems.length > 0) {
            console.log(chalk.blue(`✓ Updated SystemName enum with: ${newSystems.join(", ")}`));
        } else {
            console.log(chalk.gray(`ℹ️ SystemName enum already contains all systems, no updates needed`));
        }
    } else {
        // If no enum found, create a new one with the provided systems
        console.log(chalk.yellow(`⚠️ Could not find SystemName enum in ${filePath}, creating new one`));

        // Sort the systems alphabetically
        const sortedSystems = [...systems].sort();

        // Create a new enum
        let newEnum = "export enum SystemName {\n";
        for (const system of sortedSystems) {
            newEnum += `  ${system} = '${system}',\n`;
        }
        newEnum += "}\n";

        // Write the new enum
        await fs.writeFile(filePath, newEnum);

        console.log(chalk.blue(`✓ Created SystemName enum with: ${systems.join(", ")}`));
    }
}
