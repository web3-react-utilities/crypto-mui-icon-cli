import chalk from "chalk";
import { promptTargetDirectory } from "../utils/prompts";
import { createBaseStructure } from "../utils/fileHelpers";

export async function initCommand(): Promise<void> {
    try {
        console.log(chalk.blue("🚀 Initializing crypto icons project structure...\n"));

        // Prompt for the target directory
        const targetDir = await promptTargetDirectory("Select target directory for crypto icon components:");

        // Create the base structure
        await createBaseStructure(targetDir);

        console.log(chalk.green("\n✅ Project structure initialized successfully!"));
        console.log(chalk.green("\nThank you for using crypto-mui-icon-cli! 🚀\n"));
        console.log(`\nTo add specific icons, run:`);
        console.log(chalk.cyan(`  npx crypto-mui-icon-cli@latest add --token BTC ETH`));
    } catch (error) {
        console.error(chalk.red("❌ Error initializing project:"), error);
        process.exit(1);
    }
}
