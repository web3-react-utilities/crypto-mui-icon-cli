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
    const dirs = ["tokens", "wallets", "systems", "common", "types", "constants"];
    for (const dir of dirs) {
        await fs.ensureDir(path.join(targetDir, dir));
        console.log(chalk.green(`✓ Created directory: ${path.join(targetDir, dir)}`));
    }

    // Create base files
    await createBaseTypes(targetDir);
    await createCommonHelpers(targetDir);
    await createIconCrypto(targetDir);
    await createIconToken(targetDir);
    await createIconTokenAndName(targetDir);
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
 * Create common helper files
 */
export async function createCommonHelpers(targetDir: string): Promise<void> {
    try {
        const commonDir = path.join(targetDir, "common");
        await fs.ensureDir(commonDir);

        // Create index.ts file in common directory
        const indexContent = `export { default as IconCrypto } from './IconCrypto';
// Export other utilities as needed
`;
        await fs.writeFile(path.join(commonDir, "index.ts"), indexContent);
        console.log(chalk.green(`✓ Created file: ${path.join(commonDir, "index.ts")}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error creating common helpers:`), error);
    }
}

/**
 *
 * Create IconToken component file
 */
export async function createIconToken(targetDir: string): Promise<void> {
    const iconTokenContent = `import { SxProps, Typography } from "@mui/material";
import { mapNameToIcon } from "../constants/iconMappings";

type Props = {
    /**
     * The value of tokeName should be in type TokenName
     * @example
     * <TokenIcon tokenName="TRX" />
     * <TokenIcon tokenName={value as any} />
     * @type {TokenName}
     */
    tokenName: keyof typeof mapNameToIcon;
    sx?: SxProps;
};
export function IconToken({ tokenName, sx }: Props) {
    if (mapNameToIcon[tokenName]) {
        const Icon = mapNameToIcon[tokenName];
        return <Icon sx={sx} />;
    }
    return <Typography sx={sx}>{tokenName}</Typography>;
}
`;
    await fs.writeFile(path.join(targetDir, "common", "IconToken.tsx"), iconTokenContent);
    console.log(chalk.green(`✓ Created file: ${path.join(targetDir, "common", "IconToken.tsx")}`));
}

/**
 *
 * Create IconTokenAndName component file
 */
export async function createIconTokenAndName(targetDir: string): Promise<void> {
    const iconTokenAndNameContent = `import { Box, SxProps, Typography } from "@mui/material";
import { Help } from "@mui/icons-material";
import { TokenName } from "../types";
import { mapNameToIcon } from "../constants/iconMappings";

type Props = {
    tokenName: TokenName | string;
    sx?: SxProps;
    sxIcon?: SxProps;
    sxText?: SxProps;
    reverse?: boolean;
};

export function IconTokenAndName({ tokenName, sx, sxIcon, sxText, reverse = false }: Props) {
    const Icon = mapNameToIcon[tokenName as keyof typeof mapNameToIcon] || Help;
    return (
        <Box sx={{ display: "flex", placeItems: "center", columnGap: 0.6, flexDirection: reverse ? "row-reverse" : undefined, width: "fit-content", ...sx }}>
            <Icon sx={{ fontSize: "24px", ...sxIcon }} />
            <Typography fontWeight={600} sx={sxText}>
                {tokenName}
            </Typography>
        </Box>
    );
}
`;
    await fs.writeFile(path.join(targetDir, "common", "IconTokenAndName.tsx"), iconTokenAndNameContent);
    console.log(chalk.green(`✓ Created file: ${path.join(targetDir, "common", "IconTokenAndName.tsx")}`));
}

/**
 * Create IconCrypto component file
 */
export async function createIconCrypto(targetDir: string): Promise<void> {
    const iconCryptoContent = `import { IconUrls } from "../types";
import { Box, SvgIconProps } from "@mui/material";
import MuiSvgIcon from "@mui/material/SvgIcon";
import { useTheme } from "@mui/material/styles";

type IconProps = SvgIconProps & {
    urls: IconUrls;
    modeOnly?: "light" | "dark";
    title: string;
};
export default function IconCrypto({ urls, title, modeOnly, ...svgProps }: IconProps) {
    const theme = useTheme();
    return (
        <MuiSvgIcon {...svgProps} titleAccess={title} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
            <Box
                component={"image"}
                width="70"
                height="70"
                xlinkHref={modeOnly ? (modeOnly == "dark" ? urls.darkModeUrl : urls.lightModeUrl) : theme.palette.mode === "dark" ? urls.darkModeUrl : urls.lightModeUrl}
                xlinkTitle={title}
            />
        </MuiSvgIcon>
    );
}
`;

    await fs.writeFile(path.join(targetDir, "common", "IconCrypto.tsx"), iconCryptoContent);
    console.log(chalk.green(`✓ Created file: ${path.join(targetDir, "common", "IconCrypto.tsx")}`));
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
export * from './common';
`;
    await fs.writeFile(path.join(targetDir, "index.ts"), mainIndexContent);

    // Category index files
    const categories = ["tokens", "wallets", "systems", "common"];
    for (const category of categories) {
        await fs.writeFile(path.join(targetDir, category, "index.ts"), "// Exports will be added automatically\n");
    }
}
