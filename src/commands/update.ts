import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { getDefaultConfig } from "../utils/config";
import { ensureImagePathsFile, updateBaseImageUrlDefinitions } from "../utils/paths";
import { promptTargetDirectory } from "../utils/prompts";

export async function updateCommand(): Promise<void> {
    try {
        console.log(chalk.blue("\n🔄 Updating crypto icon configuration...\n"));

        // Resolve target directory from config or prompt
        let targetDir: string | undefined;
        try {
            targetDir = getDefaultConfig().targetDirectory;
        } catch {
            // ignore
        }
        if (!targetDir) {
            targetDir = await promptTargetDirectory("Select target directory for the icons:");
        }

        // Ensure directory exists
        await fs.ensureDir(targetDir);

        // Path to constants/imagePaths.ts
        const imagePathsFile = path.join(targetDir, "constants", "imagePaths.ts");

        // Make sure file exists (won't override content if already there)
        await ensureImagePathsFile(imagePathsFile);

        // Update base URL definitions to Firebase Hosting
        await updateBaseImageUrlDefinitions(imagePathsFile);

        console.log(chalk.green("\n✅ Update complete. No re-init required."));
    } catch (error) {
        console.error(chalk.red("❌ Error running update command:"), error);
        process.exit(1);
    }
}
