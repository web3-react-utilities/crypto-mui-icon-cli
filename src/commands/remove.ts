import chalk from "chalk";
import path from "path";
import { Command } from "commander";
import { RemoveCommandOptions } from "../types";
import { promptRemoveType, promptTokensToRemove, promptWalletsToRemove, promptSystemsToRemove, promptTargetDirectory } from "../utils/prompts";
import { removeTokens, removeWallets, removeSystems } from "../utils/remove";

export async function removeCommand(options: RemoveCommandOptions): Promise<void> {
    try {
        console.log(chalk.blue("🗑️ Removing crypto icons from your project...\n"));

        let { token: tokens = [], wallet: wallets = [], system: systems = [], dir: targetDir } = options;

        // If no tokens, wallets or systems specified, prompt the user
        if (tokens.length === 0 && wallets.length === 0 && systems.length === 0) {
            const removeType = await promptRemoveType();

            if (removeType === "Cancel") {
                console.log(chalk.yellow("Operation canceled."));
                return;
            }

            // Get items to remove based on type
            switch (removeType) {
                case "Tokens":
                    tokens = await promptTokensToRemove();
                    break;
                case "Wallets":
                    wallets = await promptWalletsToRemove();
                    break;
                case "Systems":
                    systems = await promptSystemsToRemove();
                    break;
            }

            if ((removeType === "Tokens" && tokens.length === 0) || (removeType === "Wallets" && wallets.length === 0) || (removeType === "Systems" && systems.length === 0)) {
                console.log(chalk.yellow("No items selected. Operation canceled."));
                return;
            }
        }

        // If directory not specified, prompt for it
        if (!targetDir) {
            targetDir = await promptTargetDirectory("Select directory containing the icons to remove:");
        }

        // Process the remove operations
        if (tokens.length > 0) {
            console.log(chalk.blue(`\nRemoving ${tokens.length} token icons...`));
            await removeTokens(tokens, targetDir);
        }

        if (wallets.length > 0) {
            console.log(chalk.blue(`\nRemoving ${wallets.length} wallet icons...`));
            await removeWallets(wallets, targetDir);
        }

        if (systems.length > 0) {
            console.log(chalk.blue(`\nRemoving ${systems.length} system icons...`));
            await removeSystems(systems, targetDir);
        }

        console.log(chalk.green("\n✓ Remove operation completed successfully!"));
    } catch (error) {
        console.error(chalk.red("Error removing crypto icons:"), error);
        process.exit(1);
    }
}

export const createRemoveCommand = (): Command => {
    const command = new Command("remove")
        .description("Remove tokens, wallets, or systems from the crypto-icons")
        .option("-t, --token [tokens...]", "Token names to remove")
        .option("-w, --wallet [wallets...]", "Wallet names to remove")
        .option("-s, --system [systems...]", "System names to remove")
        .option("-d, --dir <directory>", "Target directory (defaults to current directory)")
        .action(async (options) => {
            const cmdOptions: RemoveCommandOptions = {
                token: options.token || [],
                wallet: options.wallet || [],
                system: options.system || [],
                dir: options.dir ? path.resolve(options.dir) : process.cwd(),
            };

            await removeCommand(cmdOptions);
        });

    return command;
};
