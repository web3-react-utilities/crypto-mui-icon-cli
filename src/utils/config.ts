import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import findUp from "find-up";

interface CliConfig {
    targetDirectory: string;
    // Add other configuration options as needed
}

const CONFIG_FILE_NAME = "crypto-mui-icon-cli.json";

/**
 * Find the root directory of the project by looking for package.json
 * @returns The path to the project root or the current directory if not found
 */
function findProjectRoot(): string {
    try {
        // Look for package.json up the directory tree
        const packageJsonPath = findUp.sync("package.json");
        if (packageJsonPath) {
            return path.dirname(packageJsonPath);
        }
    } catch (error) {
        console.warn(chalk.yellow("⚠️ Could not find project root. Using current directory."));
    }

    return process.cwd();
}

/**
 * Get default configuration from the config file in project root
 * Falls back to a default configuration if the file doesn't exist
 */
export function getDefaultConfig(): CliConfig {
    try {
        const projectRoot = findProjectRoot();
        const configPath = path.join(projectRoot, CONFIG_FILE_NAME);

        if (fs.existsSync(configPath)) {
            const configContent = fs.readFileSync(configPath, "utf8");
            return JSON.parse(configContent);
        }
    } catch (error) {
        console.warn(chalk.yellow("⚠️ Could not read configuration file. Using default settings."));
    }

    // Return default configuration
    return {
        targetDirectory: "./src/libs/crypto-icons",
    };
}

/**
 * Save configuration to the config file in project root
 */
export async function saveConfig(config: CliConfig): Promise<void> {
    try {
        const projectRoot = findProjectRoot();
        const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green(`✓ Configuration saved to ${configPath}`));
    } catch (error) {
        console.error(chalk.red("❌ Error saving configuration:"), error);
    }
}

/**
 * Update configuration with new values
 */
export async function updateConfig(newValues: Partial<CliConfig>): Promise<void> {
    const currentConfig = getDefaultConfig();
    const updatedConfig = { ...currentConfig, ...newValues };
    await saveConfig(updatedConfig);
}
