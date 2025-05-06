import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

/**
 * Remove token components from target directory
 */
export async function removeTokens(tokens: string[], targetDir: string): Promise<void> {
    const tokensDir = path.join(targetDir, "tokens");
    const typesDir = path.join(targetDir, "types");
    const constantsDir = path.join(targetDir, "constants");

    if (!(await fs.pathExists(tokensDir))) {
        console.log(chalk.yellow(`⚠️ Tokens directory does not exist: ${tokensDir}`));
        return;
    }

    console.log(chalk.blue(`\nRemoving ${tokens.length} token icons...`));

    for (const token of tokens) {
        try {
            // Remove the token component file
            const tokenFilePath = path.join(tokensDir, `Icon${token}.tsx`);
            if (await fs.pathExists(tokenFilePath)) {
                await fs.remove(tokenFilePath);
                console.log(chalk.green(`✓ Removed token component: ${token}`));
            } else {
                console.log(chalk.yellow(`⚠️ Token component not found: ${token}`));
            }

            // Remove from exports
            await removeFromTokenExports(path.join(tokensDir, "index.ts"), token);

            // Remove from enum
            await removeFromTokenEnum(path.join(typesDir, "TokenName.ts"), token);

            // Remove from image paths
            await removeImagePathConstant(path.join(constantsDir, "imagePaths.ts"), token);

            // Remove from iconMappings
            await removeTokenMapping(path.join(constantsDir, "iconMappings.ts"), token);
        } catch (error) {
            console.error(chalk.red(`❌ Error removing token ${token}:`), error);
        }
    }
}

/**
 * Remove wallet components from target directory
 */
export async function removeWallets(wallets: string[], targetDir: string): Promise<void> {
    const walletsDir = path.join(targetDir, "wallets");
    const typesDir = path.join(targetDir, "types");
    const constantsDir = path.join(targetDir, "constants");

    if (!(await fs.pathExists(walletsDir))) {
        console.log(chalk.yellow(`⚠️ Wallets directory does not exist: ${walletsDir}`));
        return;
    }

    console.log(chalk.blue(`\nRemoving ${wallets.length} wallet icons...`));

    for (const wallet of wallets) {
        try {
            // Remove the wallet component file
            const walletFilePath = path.join(walletsDir, `Icon${wallet}.tsx`);
            if (await fs.pathExists(walletFilePath)) {
                await fs.remove(walletFilePath);
                console.log(chalk.green(`✓ Removed wallet component: ${wallet}`));
            } else {
                console.log(chalk.yellow(`⚠️ Wallet component not found: ${wallet}`));
            }

            // Remove from exports
            await removeFromWalletExports(path.join(walletsDir, "index.ts"), wallet);

            // Remove from enum
            await removeFromWalletEnum(path.join(typesDir, "WalletName.ts"), wallet);

            // Remove from image paths
            await removeWalletImagePathConstant(path.join(constantsDir, "imagePaths.ts"), wallet);
        } catch (error) {
            console.error(chalk.red(`❌ Error removing wallet ${wallet}:`), error);
        }
    }
}

/**
 * Remove system components from target directory
 */
export async function removeSystems(systems: string[], targetDir: string): Promise<void> {
    const systemsDir = path.join(targetDir, "systems");
    const typesDir = path.join(targetDir, "types");
    const constantsDir = path.join(targetDir, "constants");

    if (!(await fs.pathExists(systemsDir))) {
        console.log(chalk.yellow(`⚠️ Systems directory does not exist: ${systemsDir}`));
        return;
    }

    console.log(chalk.blue(`\nRemoving ${systems.length} system icons...`));

    for (const system of systems) {
        try {
            // Remove the system component file
            const systemFilePath = path.join(systemsDir, `Icon${system}.tsx`);
            if (await fs.pathExists(systemFilePath)) {
                await fs.remove(systemFilePath);
                console.log(chalk.green(`✓ Removed system component: ${system}`));
            } else {
                console.log(chalk.yellow(`⚠️ System component not found: ${system}`));
            }

            // Remove from exports
            await removeFromSystemExports(path.join(systemsDir, "index.ts"), system);

            // Remove from enum
            await removeFromSystemEnum(path.join(typesDir, "SystemName.ts"), system);

            // Remove from image paths
            await removeSystemImagePathConstant(path.join(constantsDir, "imagePaths.ts"), system);
        } catch (error) {
            console.error(chalk.red(`❌ Error removing system ${system}:`), error);
        }
    }
}

/**
 * Remove token from exports
 */
export async function removeFromTokenExports(filePath: string, token: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const exportLine = `export { Icon${token} } from './Icon${token}';\n`;

        if (content.includes(exportLine)) {
            content = content.replace(exportLine, "");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from exports: ${token}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing token from exports: ${token}`), error);
    }
}

/**
 * Remove wallet from exports
 */
export async function removeFromWalletExports(filePath: string, wallet: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const exportLine = `export { Icon${wallet} } from './Icon${wallet}';\n`;

        if (content.includes(exportLine)) {
            content = content.replace(exportLine, "");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from exports: ${wallet}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing wallet from exports: ${wallet}`), error);
    }
}

/**
 * Remove system from exports
 */
export async function removeFromSystemExports(filePath: string, system: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const exportLine = `export { Icon${system} } from './Icon${system}';\n`;

        if (content.includes(exportLine)) {
            content = content.replace(exportLine, "");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from exports: ${system}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing system from exports: ${system}`), error);
    }
}

/**
 * Remove token from enum
 */
export async function removeFromTokenEnum(filePath: string, token: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const enumRegex = /export enum TokenName \{[^}]*\}/s;
        const match = content.match(enumRegex);

        if (match) {
            const existingEnum = match[0];
            const tokenLineRegex = new RegExp(`\\s+${token}\\s*=\\s*['"]${token}['"],?\\n?`, "g");

            // Remove the token line from the enum
            const updatedEnum = existingEnum.replace(tokenLineRegex, "");

            // Replace the old enum with the updated one
            content = content.replace(enumRegex, updatedEnum);
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from TokenName enum: ${token}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing token from enum: ${token}`), error);
    }
}

/**
 * Remove wallet from enum
 */
export async function removeFromWalletEnum(filePath: string, wallet: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const enumRegex = /export enum WalletName \{[^}]*\}/s;
        const match = content.match(enumRegex);

        if (match) {
            const existingEnum = match[0];
            const walletLineRegex = new RegExp(`\\s+${wallet}\\s*=\\s*['"]${wallet}['"],?\\n?`, "g");

            // Remove the wallet line from the enum
            const updatedEnum = existingEnum.replace(walletLineRegex, "");

            // Replace the old enum with the updated one
            content = content.replace(enumRegex, updatedEnum);
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from WalletName enum: ${wallet}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing wallet from enum: ${wallet}`), error);
    }
}

/**
 * Remove system from enum
 */
export async function removeFromSystemEnum(filePath: string, system: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const enumRegex = /export enum SystemName \{[^}]*\}/s;
        const match = content.match(enumRegex);

        if (match) {
            const existingEnum = match[0];
            const systemLineRegex = new RegExp(`\\s+${system}\\s*=\\s*['"]${system}['"],?\\n?`, "g");

            // Remove the system line from the enum
            const updatedEnum = existingEnum.replace(systemLineRegex, "");

            // Replace the old enum with the updated one
            content = content.replace(enumRegex, updatedEnum);
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed from SystemName enum: ${system}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing system from enum: ${system}`), error);
    }
}

/**
 * Remove image path constant for a token
 */
export async function removeImagePathConstant(filePath: string, token: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const constRegex = new RegExp(`\\nexport const PNG_${token}: IconUrls = \\{[^}]*\\};\\n`, "g");

        if (constRegex.test(content)) {
            content = content.replace(constRegex, "\n");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed image path for token: ${token}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing image path for token: ${token}`), error);
    }
}

/**
 * Remove image path constant for a wallet
 */
export async function removeWalletImagePathConstant(filePath: string, wallet: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const constRegex = new RegExp(`\\nexport const PNG_WALLET_${wallet.toUpperCase()}: IconUrls = \\{[^}]*\\};\\n`, "g");

        if (constRegex.test(content)) {
            content = content.replace(constRegex, "\n");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed image path for wallet: ${wallet}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing image path for wallet: ${wallet}`), error);
    }
}

/**
 * Remove image path constant for a system
 */
export async function removeSystemImagePathConstant(filePath: string, system: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");
        const constRegex = new RegExp(`\\nexport const PNG_SYSTEM_${system.toUpperCase()}: IconUrls = \\{[^}]*\\};\\n`, "g");

        if (constRegex.test(content)) {
            content = content.replace(constRegex, "\n");
            await fs.writeFile(filePath, content);
            console.log(chalk.green(`✓ Removed image path for system: ${system}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error removing image path for system: ${system}`), error);
    }
}

/**
 * Remove token mapping from icon mappings file
 */
export async function removeTokenMapping(filePath: string, token: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }

    try {
        let content = await fs.readFile(filePath, "utf-8");

        // Remove import statement
        const importRegex = new RegExp(`import \\{ Icon${token} \\} from '\\.\\./tokens/Icon${token}';\\n`, "g");
        content = content.replace(importRegex, "");

        // Remove mapping entry
        const mappingRegex = new RegExp(`\\s+\\[TokenName\\.${token}\\]: Icon${token},\\n`, "g");
        content = content.replace(mappingRegex, "");

        await fs.writeFile(filePath, content);
        console.log(chalk.green(`✓ Removed token mapping for: ${token}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error removing token mapping for: ${token}`), error);
    }
}
