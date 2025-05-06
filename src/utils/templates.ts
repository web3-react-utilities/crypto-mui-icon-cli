import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { ensureImagePathsFile, addImagePathConstant, addWalletImagePathConstant, addSystemImagePathConstant, ensureIconMappingsFile, updateTokenMapping } from "./paths";
import { updateTokenEnum, updateTokenExports, updateWalletEnum, updateWalletExports, updateSystemEnum, updateSystemExports } from "./enums";

/**
 * Copy token templates to target directory
 */
export async function copyTokenTemplates(tokens: string[], targetDir: string): Promise<void> {
    const tokensDir = path.join(targetDir, "tokens");
    await fs.ensureDir(tokensDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create types directory if it doesn't exist
    const typesDir = path.join(targetDir, "types");
    await fs.ensureDir(typesDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    // Ensure iconMappings file exists
    await ensureIconMappingsFile(path.join(constantsDir, "iconMappings.ts"));

    for (const token of tokens) {
        const templatePath = path.join(__dirname, "..", "templates", "tokens", "TokenTemplate.tsx");
        const destPath = path.join(tokensDir, `Icon${token}.tsx`);
        const tokenEnumPath = path.join(typesDir, "TokenName.ts");
        const tokenExportsPath = path.join(tokensDir, "index.ts");
        const iconMappingsPath = path.join(constantsDir, "iconMappings.ts");
        const imagePathsFile = path.join(constantsDir, "imagePaths.ts");

        try {
            let fileExists = await fs.pathExists(destPath);

            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createTokenTemplate();
            }

            if (fileExists) {
                console.log(chalk.blue(`🔍 Token file ${token} exists, checking references...`));

                // Check if token is properly declared in enum
                let tokenInEnum = false;
                if (await fs.pathExists(tokenEnumPath)) {
                    const enumContent = await fs.readFile(tokenEnumPath, "utf-8");
                    tokenInEnum = enumContent.includes(`${token} = '${token}'`);
                }

                // Check if token is exported in index.ts
                let tokenExported = false;
                if (await fs.pathExists(tokenExportsPath)) {
                    const exportsContent = await fs.readFile(tokenExportsPath, "utf-8");
                    tokenExported = exportsContent.includes(`export { Icon${token} } from './Icon${token}'`);
                }

                // Check if token is mapped in iconMappings.ts
                let tokenMapped = false;
                if (await fs.pathExists(iconMappingsPath)) {
                    const mappingsContent = await fs.readFile(iconMappingsPath, "utf-8");
                    tokenMapped = mappingsContent.includes(`[TokenName.${token}]: Icon${token}`);
                }

                // Check if image path constant exists
                let imagePathExists = false;
                if (await fs.pathExists(imagePathsFile)) {
                    const imagePathsContent = await fs.readFile(imagePathsFile, "utf-8");
                    imagePathExists = imagePathsContent.includes(`PNG_${token}`);
                }

                // Update missing references if needed
                if (!tokenInEnum) {
                    console.log(chalk.yellow(`⚠️ Token ${token} missing in TokenName enum, adding it...`));
                    await updateTokenEnum(tokenEnumPath, [token]);
                }

                if (!tokenExported) {
                    console.log(chalk.yellow(`⚠️ Token ${token} missing in exports, adding it...`));
                    await updateTokenExports(tokenExportsPath, [token]);
                }

                if (!tokenMapped) {
                    console.log(chalk.yellow(`⚠️ Token ${token} missing in icon mappings, adding it...`));
                    await updateTokenMapping(iconMappingsPath, token);
                }

                if (!imagePathExists) {
                    console.log(chalk.yellow(`⚠️ Token ${token} missing image path constant, adding it...`));
                    await addImagePathConstant(imagePathsFile, token);
                }

                if (tokenInEnum && tokenExported && tokenMapped && imagePathExists) {
                    console.log(chalk.green(`✓ Token ${token} is properly referenced in all files.`));
                } else {
                    console.log(chalk.green(`✓ Fixed missing references for token: ${token}`));
                }
            } else {
                // Create new token component file
                // Read template and replace placeholders
                let templateContent = await fs.readFile(templatePath, "utf-8");
                templateContent = templateContent.replace(/{{TOKEN_NAME}}/g, token);

                // Write the file
                await fs.writeFile(destPath, templateContent);

                // Update image paths
                await addImagePathConstant(imagePathsFile, token);

                // Update token mapping
                await updateTokenMapping(iconMappingsPath, token);

                // Update token enum
                await updateTokenEnum(tokenEnumPath, [token]);

                // Update token exports
                await updateTokenExports(tokenExportsPath, [token]);

                console.log(chalk.green(`✓ Created token icon: ${token}`));
            }
        } catch (error) {
            console.error(chalk.red(`Error processing token ${token}:`), error);
        }
    }
}

/**
 * Copy wallet templates to target directory
 */
export async function copyWalletTemplates(wallets: string[], targetDir: string): Promise<void> {
    const walletsDir = path.join(targetDir, "wallets");
    await fs.ensureDir(walletsDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create types directory if it doesn't exist
    const typesDir = path.join(targetDir, "types");
    await fs.ensureDir(typesDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    for (const wallet of wallets) {
        const templatePath = path.join(__dirname, "..", "templates", "wallets", "WalletTemplate.tsx");
        const destPath = path.join(walletsDir, `Icon${wallet}.tsx`);
        const walletEnumPath = path.join(typesDir, "WalletName.ts");
        const walletExportsPath = path.join(walletsDir, "index.ts");
        const imagePathsFile = path.join(constantsDir, "imagePaths.ts");

        try {
            let fileExists = await fs.pathExists(destPath);

            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createWalletTemplate();
            }

            if (fileExists) {
                console.log(chalk.blue(`🔍 Wallet file ${wallet} exists, checking references...`));

                // Check if wallet is properly declared in enum
                let walletInEnum = false;
                if (await fs.pathExists(walletEnumPath)) {
                    const enumContent = await fs.readFile(walletEnumPath, "utf-8");
                    walletInEnum = enumContent.includes(`${wallet} = '${wallet}'`);
                }

                // Check if wallet is exported in index.ts
                let walletExported = false;
                if (await fs.pathExists(walletExportsPath)) {
                    const exportsContent = await fs.readFile(walletExportsPath, "utf-8");
                    walletExported = exportsContent.includes(`export { Icon${wallet} } from './Icon${wallet}'`);
                }

                // Check if image path constant exists
                let imagePathExists = false;
                if (await fs.pathExists(imagePathsFile)) {
                    const imagePathsContent = await fs.readFile(imagePathsFile, "utf-8");
                    imagePathExists = imagePathsContent.includes(`PNG_WALLET_${wallet.toUpperCase()}`);
                }

                // Update missing references if needed
                if (!walletInEnum) {
                    console.log(chalk.yellow(`⚠️ Wallet ${wallet} missing in WalletName enum, adding it...`));
                    await updateWalletEnum(walletEnumPath, [wallet]);
                }

                if (!walletExported) {
                    console.log(chalk.yellow(`⚠️ Wallet ${wallet} missing in exports, adding it...`));
                    await updateWalletExports(walletExportsPath, [wallet]);
                }

                if (!imagePathExists) {
                    console.log(chalk.yellow(`⚠️ Wallet ${wallet} missing image path constant, adding it...`));
                    await addWalletImagePathConstant(imagePathsFile, wallet);
                }

                if (walletInEnum && walletExported && imagePathExists) {
                    console.log(chalk.green(`✓ Wallet ${wallet} is properly referenced in all files.`));
                } else {
                    console.log(chalk.green(`✓ Fixed missing references for wallet: ${wallet}`));
                }
            } else {
                // Create new wallet component file
                // Read template and replace placeholders
                let templateContent = await fs.readFile(templatePath, "utf-8");
                templateContent = templateContent.replace(/{{WALLET_NAME}}/g, wallet);

                // Write the file
                await fs.writeFile(destPath, templateContent);

                // Update image paths
                await addWalletImagePathConstant(imagePathsFile, wallet);

                // Update wallet enum
                await updateWalletEnum(walletEnumPath, [wallet]);

                // Update wallet exports
                await updateWalletExports(walletExportsPath, [wallet]);

                console.log(chalk.green(`✓ Created wallet icon: ${wallet}`));
            }
        } catch (error) {
            console.error(chalk.red(`Error processing wallet ${wallet}:`), error);
        }
    }
}

/**
 * Copy system templates to target directory
 */
export async function copySystemTemplates(systems: string[], targetDir: string): Promise<void> {
    const systemsDir = path.join(targetDir, "systems");
    await fs.ensureDir(systemsDir);

    // Create constants directory for image paths if it doesn't exist
    const constantsDir = path.join(targetDir, "constants");
    await fs.ensureDir(constantsDir);

    // Create types directory if it doesn't exist
    const typesDir = path.join(targetDir, "types");
    await fs.ensureDir(typesDir);

    // Create or update image paths file
    await ensureImagePathsFile(path.join(constantsDir, "imagePaths.ts"));

    for (const system of systems) {
        const templatePath = path.join(__dirname, "..", "templates", "systems", "SystemTemplate.tsx");
        const destPath = path.join(systemsDir, `Icon${system}.tsx`);
        const systemEnumPath = path.join(typesDir, "SystemName.ts");
        const systemExportsPath = path.join(systemsDir, "index.ts");
        const imagePathsFile = path.join(constantsDir, "imagePaths.ts");

        try {
            let fileExists = await fs.pathExists(destPath);

            // If template doesn't exist yet, create a basic one
            if (!(await fs.pathExists(templatePath))) {
                await createSystemTemplate();
            }

            if (fileExists) {
                console.log(chalk.blue(`🔍 System file ${system} exists, checking references...`));

                // Check if system is properly declared in enum
                let systemInEnum = false;
                if (await fs.pathExists(systemEnumPath)) {
                    const enumContent = await fs.readFile(systemEnumPath, "utf-8");
                    systemInEnum = enumContent.includes(`${system} = '${system}'`);
                }

                // Check if system is exported in index.ts
                let systemExported = false;
                if (await fs.pathExists(systemExportsPath)) {
                    const exportsContent = await fs.readFile(systemExportsPath, "utf-8");
                    systemExported = exportsContent.includes(`export { Icon${system} } from './Icon${system}'`);
                }

                // Check if image path constant exists
                let imagePathExists = false;
                if (await fs.pathExists(imagePathsFile)) {
                    const imagePathsContent = await fs.readFile(imagePathsFile, "utf-8");
                    imagePathExists = imagePathsContent.includes(`PNG_SYSTEM_${system.toUpperCase()}`);
                }

                // Update missing references if needed
                if (!systemInEnum) {
                    console.log(chalk.yellow(`⚠️ System ${system} missing in SystemName enum, adding it...`));
                    await updateSystemEnum(systemEnumPath, [system]);
                }

                if (!systemExported) {
                    console.log(chalk.yellow(`⚠️ System ${system} missing in exports, adding it...`));
                    await updateSystemExports(systemExportsPath, [system]);
                }

                if (!imagePathExists) {
                    console.log(chalk.yellow(`⚠️ System ${system} missing image path constant, adding it...`));
                    await addSystemImagePathConstant(imagePathsFile, system);
                }

                if (systemInEnum && systemExported && imagePathExists) {
                    console.log(chalk.green(`✓ System ${system} is properly referenced in all files.`));
                } else {
                    console.log(chalk.green(`✓ Fixed missing references for system: ${system}`));
                }
            } else {
                // Create new system component file
                // Read template and replace placeholders
                let templateContent = await fs.readFile(templatePath, "utf-8");
                templateContent = templateContent.replace(/{{SYSTEM_NAME}}/g, system);

                // Write the file
                await fs.writeFile(destPath, templateContent);

                // Update image paths
                await addSystemImagePathConstant(imagePathsFile, system);

                // Update system enum
                await updateSystemEnum(systemEnumPath, [system]);

                // Update system exports
                await updateSystemExports(systemExportsPath, [system]);

                console.log(chalk.green(`✓ Created system icon: ${system}`));
            }
        } catch (error) {
            console.error(chalk.red(`Error processing system ${system}:`), error);
        }
    }
}

/**
 * Create token template file if it doesn't exist
 */
export async function createTokenTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "tokens");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_{{TOKEN_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{TOKEN_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{TOKEN_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_{{TOKEN_NAME}}.darkmode : PNG_{{TOKEN_NAME}}.lightmode} 
        xlinkTitle={'{{TOKEN_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "TokenTemplate.tsx"), templateContent);
}

/**
 * Create wallet template file if it doesn't exist
 */
export async function createWalletTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "wallets");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_WALLET_{{WALLET_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{WALLET_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{WALLET_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_WALLET_{{WALLET_NAME}}.darkmode : PNG_WALLET_{{WALLET_NAME}}.lightmode} 
        xlinkTitle={'{{WALLET_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "WalletTemplate.tsx"), templateContent);
}

/**
 * Create system template file if it doesn't exist
 */
export async function createSystemTemplate(): Promise<void> {
    const templateDir = path.join(__dirname, "..", "templates", "systems");
    await fs.ensureDir(templateDir);

    const templateContent = `import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_SYSTEM_{{SYSTEM_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{SYSTEM_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{SYSTEM_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_SYSTEM_{{SYSTEM_NAME}}.darkmode : PNG_SYSTEM_{{SYSTEM_NAME}}.lightmode} 
        xlinkTitle={'{{SYSTEM_NAME}}'}
      />
    </MuiSvgIcon>
  );
};
`;

    await fs.writeFile(path.join(templateDir, "SystemTemplate.tsx"), templateContent);
}
