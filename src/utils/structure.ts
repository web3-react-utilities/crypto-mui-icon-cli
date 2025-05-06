import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

/**
 * Create base structure for crypto icons
 */
export async function createBaseStructure(targetDir: string): Promise<void> {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);

    // Create subdirectories
    const dirs = ["tokens", "wallets", "systems", "utils", "types", "constants"];
    for (const dir of dirs) {
        await fs.ensureDir(path.join(targetDir, dir));
        console.log(chalk.green(`✓ Created directory: ${path.join(targetDir, dir)}`));
    }

    // Create base files
    await createBaseTypes(targetDir);
    await createBaseUtils(targetDir);
    await createIndexExports(targetDir);

    console.log(chalk.green("✓ Created base files"));
}

/**
 * Create base types file
 */
export async function createBaseTypes(targetDir: string): Promise<void> {
    const typesDir = path.join(targetDir, "types");

    // Create TokenName.ts
    const tokenNameContent = `export enum TokenName {
  // This will be populated automatically as you add tokens
}
`;
    await fs.writeFile(path.join(typesDir, "TokenName.ts"), tokenNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "TokenName.ts")}`));

    // Create WalletName.ts
    const walletNameContent = `export enum WalletName {
  // This will be populated automatically as you add wallets
}
`;
    await fs.writeFile(path.join(typesDir, "WalletName.ts"), walletNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "WalletName.ts")}`));

    // Create SystemName.ts
    const systemNameContent = `export enum SystemName {
  // This will be populated automatically as you add systems
}
`;
    await fs.writeFile(path.join(typesDir, "SystemName.ts"), systemNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "SystemName.ts")}`));

    // Create index.ts that exports all types
    const indexContent = `import { SvgIconProps } from '@mui/material/SvgIcon';

export type SvgComponent = React.FC<SvgIconProps>;

export interface IconUrls {
  lightmode: string;
  darkmode: string;
}

export { TokenName } from './TokenName';
export { WalletName } from './WalletName';
export { SystemName } from './SystemName';
`;

    await fs.writeFile(path.join(typesDir, "index.ts"), indexContent);
    console.log(chalk.green(`✓ Created file: ${path.join(typesDir, "index.ts")}`));

    // Create iconMappings.ts in constants directory
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    const iconMappingsContent = `import { TokenName, SvgComponent } from '../types';

/**
 * Maps token names to their respective icon components
 * This file is auto-generated and will be updated by the CLI
 */
export const mapNameToIcon: Record<TokenName, SvgComponent> = {
  // This will be populated automatically as you add tokens
};
`;

    await fs.writeFile(path.join(constantsDir, "iconMappings.ts"), iconMappingsContent);
    console.log(chalk.green(`✓ Created file: ${path.join(constantsDir, "iconMappings.ts")}`));
}

/**
 * Create base utils file
 */
export async function createBaseUtils(targetDir: string): Promise<void> {
    const utilsContent = `import { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

export const withTitle = (Component: React.FC<SvgIconProps>, title: string): React.FC<SvgIconProps> => {
  return (props) => <Component {...props} titleAccess={title} />;
};
`;

    await fs.writeFile(path.join(targetDir, "utils", "iconHelpers.ts"), utilsContent);
}

/**
 * Create index export files
 */
export async function createIndexExports(targetDir: string): Promise<void> {
    // Main index file
    const mainIndexContent = `export * from './tokens';
export * from './wallets';
export * from './systems';
export * from './types';
`;
    await fs.writeFile(path.join(targetDir, "index.ts"), mainIndexContent);

    // Category index files
    const categories = ["tokens", "wallets", "systems"];
    for (const category of categories) {
        await fs.writeFile(path.join(targetDir, category, "index.ts"), "// Exports will be added automatically\n");
    }
}
