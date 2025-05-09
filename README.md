# Crypto MUI Icon CLI

A CLI tool for managing and adding crypto token icons with MUI support to your React project. This tool helps you add only the icons you need, instead of importing the entire heavy icon library.

## Installation

```bash
# Use with npx (no installation needed)
npx crypto-mui-icon-cli@latest <command>
```

## Updating

When using npx with @latest, it will automatically use the latest version, but you can force an update with:

```bash
npx clear-npx-cache
npx crypto-mui-icon-cli@latest <command>
```

You can check your current version:

```bash
npx crypto-mui-icon-cli@latest --version
```

## Usage

### Initialize Basic Structure

```bash
npx crypto-mui-icon-cli@latest init
```

This command will create the basic folder structure for crypto icons:

```
/your-project
  /src
    /libs
      /crypto-icons
        /tokens       # Contains token icons
        /wallets      # Contains wallet icons
        /systems      # Contains system icons
        /common       # Common utilities and shared components
        /types        # Type definitions
        /constants    # Constant values
```

### Adding Icons

```bash
# Add one or more token icons
npx crypto-mui-icon-cli@latest add --token BTC ETH SOL

# Add one or more wallet icons
npx crypto-mui-icon-cli@latest add --wallet MetaMask WalletConnect

# Add system icons
npx crypto-mui-icon-cli@latest add --system Blockchain NFT

# Add multiple types of icons at once
npx crypto-mui-icon-cli@latest add --token BTC ETH --wallet MetaMask

# Specify a target directory
npx crypto-mui-icon-cli@latest add --token BTC --dir ./src/assets/crypto
```

If no options are specified, the tool will display an interactive menu for you to choose from.

### Removing Icons

```bash
# Remove one or more token icons
npx crypto-mui-icon-cli@latest remove --token BTC ETH

# Remove one or more wallet icons
npx crypto-mui-icon-cli@latest remove --wallet MetaMask WalletConnect

# Remove system icons
npx crypto-mui-icon-cli@latest remove --system Blockchain NFT

# Remove multiple types of icons at once
npx crypto-mui-icon-cli@latest remove --token BTC --wallet MetaMask

# Specify the target directory containing icons to remove
npx crypto-mui-icon-cli@latest remove --token BTC --dir ./src/libs/crypto-icons
```

If no options are specified, the tool will display an interactive menu for you to choose which icons to remove.

When you remove an icon, the following updates are made:

1. The icon component file is deleted
2. The export statement is removed from the respective index.ts file
3. The entry is removed from the corresponding enum (TokenName, WalletName, or SystemName)
4. The image path constant is removed from constants/imagePaths.ts
5. For tokens, the mapping is also removed from iconMappings.ts

### Configuration

The CLI tool uses a project-specific configuration through a `crypto-mui-icon-cli.json` file stored in your project's root directory (same folder as your package.json). This keeps project configuration together with the project itself.

#### Default Configuration

When you don't specify a target directory, the CLI will:

1. Look for a configuration file in your project's root directory
2. Use the directory specified in that configuration
3. If no configuration exists, use the default path or prompt you to select a directory

#### Automatic Configuration

When you specify a target directory with `--dir`, it's automatically saved to the configuration file for future use:

```bash
npx crypto-mui-icon-cli@latest add --token BTC --dir ./my-custom-path
# Future commands in this project will default to ./my-custom-path
```

#### Manual Configuration

You can also manually create or edit the configuration file `crypto-mui-icon-cli.json` in your project root:

```json
{
    "targetDirectory": "./src/libs/crypto-icons"
}
```

This project-specific approach means each project can have its own configuration, which is especially useful in monorepo setups or when working on multiple projects.

## Generated Structure

When you add a token icon, for example BTC, the following files will be created or updated:

1. `./src/libs/crypto-icons/tokens/IconBTC.tsx` - Component for the BTC icon
2. `./src/libs/crypto-icons/tokens/index.ts` - Exports for the icon
3. `./src/libs/crypto-icons/types/TokenName.ts` - Updates to the TokenName enum
4. `./src/libs/crypto-icons/constants/imagePaths.ts` - Image URLs

## Using in Your Project

After adding the icons, you can use them in your project as follows:

```jsx
import { IconBTC } from "./libs/crypto-icons/tokens";

function App() {
    return (
        <div>
            <h1>Bitcoin Icon</h1>
            <IconBTC />

            {/* With MUI SvgIcon props */}
            <IconBTC fontSize="large" color="primary" />
        </div>
    );
}
```

## Contribution

Contributions are always welcome! Please create an issue or pull request if you want to add features or fix bugs.

## License

ISC

## Supported Icons

This package supports various cryptocurrency tokens, wallets, and systems. For a complete list of supported icons, please refer to the following documentation:

-   [Supported Tokens](./TOKENS.md)
-   [Supported Wallets](./WALLETS.md)
-   [Supported Systems](./SYSTEMS.md)

These lists contain all available icons that can be used with the `add` command.
