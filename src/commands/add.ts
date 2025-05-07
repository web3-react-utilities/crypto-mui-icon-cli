import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { AddCommandOptions } from "../types";
import { promptTokens, promptWallets, promptTargetDirectory } from "../utils/prompts";
import { copyTokenTemplates, copyWalletTemplates, copySystemTemplates, updateExports } from "../utils/fileHelpers";
import { getDefaultConfig, updateConfig } from "../utils/config";

export async function addCommand(options: AddCommandOptions): Promise<void> {
    try {
        console.log(chalk.blue("🚀 Adding crypto icons to your project...\n"));

        let { token: tokens, wallet: wallets, system: systems, dir: targetDir } = options;

        // If no tokens, wallets or systems specified, prompt the user
        if (!tokens?.length && !wallets?.length && !systems?.length) {
            tokens = await promptTokens();
        }

        // If directory not specified, use the default config
        if (!targetDir) {
            try {
                const config = getDefaultConfig();
                targetDir = config.targetDirectory;
                console.log(chalk.blue(`Using target directory from configuration: ${targetDir}`));
            } catch (error) {
                // If we can't get the config, prompt the user
                targetDir = await promptTargetDirectory("Select target directory for the icons:");
            }
        } else {
            // If directory is explicitly specified, update the config
            console.log(chalk.blue(`Using specified target directory: ${targetDir}`));
            await updateConfig({ targetDirectory: targetDir });
        }

        // For debugging - can be removed in production
        console.log(chalk.yellow(`Debug - Target directory: ${targetDir}`));

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
