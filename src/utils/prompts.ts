import inquirer from "inquirer";
import { TokenName, WalletName, SystemName } from "../types";

/**
 * Prompt user to select tokens to add
 */
export async function promptTokens(): Promise<string[]> {
    // Get enum keys and filter out numeric keys (which Object.values includes for enums)
    const tokenChoices = Object.keys(TokenName).filter((key) => isNaN(Number(key)));

    const { selectedTokens } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedTokens",
        message: "Select tokens to add:",
        choices: tokenChoices,
    });

    return selectedTokens;
}

/**
 * Prompt user to select wallets to add
 */
export async function promptWallets(): Promise<string[]> {
    // Get enum keys and filter out numeric keys
    const walletChoices = Object.keys(WalletName).filter((key) => isNaN(Number(key)));

    const { selectedWallets } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedWallets",
        message: "Select wallets to add:",
        choices: walletChoices,
    });

    return selectedWallets;
}

/**
 * Prompt user to select systems to add
 */
export async function promptSystems(): Promise<string[]> {
    // Get enum keys and filter out numeric keys
    const systemChoices = Object.keys(SystemName).filter((key) => isNaN(Number(key)));

    const { selectedSystems } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedSystems",
        message: "Select systems to add:",
        choices: systemChoices,
    });

    return selectedSystems;
}

/**
 * Prompt user to select target directory
 */
export async function promptTargetDirectory(message: string = "Select target directory:"): Promise<string> {
    const { targetDir } = await inquirer.prompt({
        type: "input",
        name: "targetDir",
        message,
        default: "./src/libs/crypto-icons",
    });

    return targetDir;
}

/**
 * Prompt user to select what type of icons to remove
 */
export async function promptRemoveType(): Promise<string> {
    const { removeType } = await inquirer.prompt({
        type: "list",
        name: "removeType",
        message: "What do you want to remove?",
        choices: ["Tokens", "Wallets", "Systems", "Cancel"],
    });

    return removeType;
}

/**
 * Prompt user to select tokens to remove
 */
export async function promptTokensToRemove(): Promise<string[]> {
    // Get enum keys and filter out numeric keys
    const tokenChoices = Object.keys(TokenName).filter((key) => isNaN(Number(key)));

    const { selectedTokens } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedTokens",
        message: "Select tokens to remove:",
        choices: tokenChoices,
    });

    return selectedTokens;
}

/**
 * Prompt user to select wallets to remove
 */
export async function promptWalletsToRemove(): Promise<string[]> {
    // Get enum keys and filter out numeric keys
    const walletChoices = Object.keys(WalletName).filter((key) => isNaN(Number(key)));

    const { selectedWallets } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedWallets",
        message: "Select wallets to remove:",
        choices: walletChoices,
    });

    return selectedWallets;
}

/**
 * Prompt user to select systems to remove
 */
export async function promptSystemsToRemove(): Promise<string[]> {
    // Get enum keys and filter out numeric keys
    const systemChoices = Object.keys(SystemName).filter((key) => isNaN(Number(key)));

    const { selectedSystems } = await inquirer.prompt({
        type: "checkbox",
        name: "selectedSystems",
        message: "Select systems to remove:",
        choices: systemChoices,
    });

    return selectedSystems;
}
