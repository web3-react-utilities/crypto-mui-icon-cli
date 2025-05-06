#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { createRemoveCommand } from "./commands/remove";

const program = new Command();

// Set up CLI information
program.name("crypto-mui-icon-cli").description("CLI tool for adding crypto icons with MUI support to your project").version("1.0.0");

// Register commands
program.command("init").description("Initialize your project with base structure for crypto icons").action(initCommand);

program
    .command("add")
    .description("Add specific token, wallet, or system icons to your project")
    .option("-t, --token <tokens...>", "Token icons to add (e.g. BTC ETH SOL)")
    .option("-w, --wallet <wallets...>", "Wallet icons to add (e.g. MetaMask WalletConnect)")
    .option("-s, --system <systems...>", "System icons to add")
    .option("-d, --dir <directory>", "Target directory for icons", "./src/libs/crypto-icons")
    .action(addCommand);

// Register remove command
program.addCommand(createRemoveCommand());

// Display help if no arguments provided
if (process.argv.length === 2) {
    program.outputHelp();
}

// Parse command line arguments
program.parse();

console.log(chalk.green("\nThank you for using crypto-mui-icon-cli! 🚀\n"));
