#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { removeCommand } from "./commands/remove";
import path from "path";
import fs from "fs-extra";

const program = new Command();

// Get version from package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageVersion = fs.existsSync(packageJsonPath) ? require(packageJsonPath).version : "1.0.0"; // Fallback version if package.json isn't found

// Set up CLI information
program.name("crypto-mui-icon-cli").description("CLI tool for adding crypto icons with MUI support to your project").version(packageVersion);

// Register commands
program.command("init").description("Initialize your project with base structure for crypto icons").action(initCommand);

program
    .command("add")
    .description("Add specific token, wallet, or system icons to your project")
    .option("-t, --token <tokens...>", "Token icons to add (e.g. BTC ETH SOL)")
    .option("-w, --wallet <wallets...>", "Wallet icons to add (e.g. MetaMask WalletConnect)")
    .option("-s, --system <systems...>", "System icons to add")
    .option("-d, --dir <directory>", "Target directory for icons") // Removed default value
    .action(addCommand);

// Register remove command
program
    .command("remove")
    .description("Remove tokens, wallets, or systems from the crypto-icons")
    .option("-t, --token [tokens...]", "Token names to remove")
    .option("-w, --wallet [wallets...]", "Wallet names to remove")
    .option("-s, --system [systems...]", "System names to remove")
    .option("-d, --dir <directory>", "Target directory (defaults to config value)")
    .action(removeCommand);

// Display help if no arguments provided
if (process.argv.length === 2) {
    program.outputHelp();
}

// Parse command line arguments
program.parse();
