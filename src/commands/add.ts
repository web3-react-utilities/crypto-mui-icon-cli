import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { Command } from "commander";
import { AddCommandOptions } from "../types";
import { promptTokens, promptWallets, promptTargetDirectory } from "../utils/prompts";
import { copyTokenTemplates, copyWalletTemplates, copySystemTemplates, updateExports } from "../utils/fileHelpers";

export async function addCommand(options: AddCommandOptions): Promise<void> {
    try {
        console.log(chalk.blue("🚀 Adding crypto icons to your project...\n"));

        let { token: tokens, wallet: wallets, system: systems, dir: targetDir } = options;

        // If no tokens, wallets or systems specified, prompt the user
        if (!tokens?.length && !wallets?.length && !systems?.length) {
            tokens = await promptTokens();
        }

        // If directory not specified, prompt for it
        if (!targetDir) {
            targetDir = await promptTargetDirectory("Select target directory for the icons:");
        }

        // Ensure the target directory exists
        await fs.ensureDir(targetDir);

        // Copy the requested templates
        if (tokens?.length) {
            console.log(chalk.blue(`\nAdding ${tokens.length} token icons...`));
            await copyTokenTemplates(tokens, targetDir);
        }

        if (wallets?.length) {
            console.log(chalk.blue(`\nAdding ${wallets.length} wallet icons...`));
            await copyWalletTemplates(wallets, targetDir);
        }

        if (systems?.length) {
            console.log(chalk.blue(`\nAdding ${systems.length} system icons...`));
            await copySystemTemplates(systems, targetDir);
        }

        // Update the export files
        await updateExports(targetDir, {
            tokens: tokens || [],
            wallets: wallets || [],
            systems: systems || [],
        });

        console.log(chalk.green("\n✅ Icons added successfully!"));
        console.log(`\nYou can now import and use the icons in your components:`);
        if (tokens?.length) {
            console.log(chalk.cyan(`  import { IconBTC } from '${path.relative(process.cwd(), path.join(targetDir, "tokens"))}'`));
        }
    } catch (error) {
        console.error(chalk.red("❌ Error adding icons:"), error);
        process.exit(1);
    }
}

export const createAddCommand = (): Command => {
    const command = new Command("add")
        .description("Add specific token, wallet, or system icons to your project")
        .option("-t, --token <tokens...>", "Token icons to add (e.g. BTC ETH SOL)")
        .option("-w, --wallet <wallets...>", "Wallet icons to add (e.g. MetaMask WalletConnect)")
        .option("-s, --system <systems...>", "System icons to add")
        .option("-d, --dir <directory>", "Target directory for icons", "./src/libs/crypto-icons")
        .action(async (options) => {
            const cmdOptions: AddCommandOptions = {
                token: options.token || [],
                wallet: options.wallet || [],
                system: options.system || [],
                dir: options.dir ? path.resolve(options.dir) : process.cwd(),
            };

            await addCommand(cmdOptions);
        });

    return command;
};
