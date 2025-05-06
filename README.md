# Crypto MUI Icon CLI

A CLI tool for managing and adding crypto token icons with MUI support to your React project. This tool helps you add only the icons you need, instead of importing the entire heavy icon library.

## Installation

```bash
# Install globally
npm install -g crypto-mui-icon-cli

# Or use directly with npx
npx crypto-mui-icon-cli <command>
```

## Usage

### Initialize Basic Structure

```bash
npx crypto-mui-icon-cli init
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
        /utils        # Utility functions
        /types        # Type definitions
        /constants    # Constant values
```

### Adding Icons

```bash
# Add one or more token icons
npx crypto-mui-icon-cli add --token BTC ETH SOL

# Add one or more wallet icons
npx crypto-mui-icon-cli add --wallet MetaMask WalletConnect

# Add system icons
npx crypto-mui-icon-cli add --system Blockchain NFT

# Add multiple types of icons at once
npx crypto-mui-icon-cli add --token BTC ETH --wallet MetaMask

# Specify a target directory
npx crypto-mui-icon-cli add --token BTC --dir ./src/assets/crypto
```

If no options are specified, the tool will display an interactive menu for you to choose from.

### Removing Icons

```bash
# Remove one or more token icons
npx crypto-mui-icon-cli remove --token BTC ETH

# Remove one or more wallet icons
npx crypto-mui-icon-cli remove --wallet MetaMask WalletConnect

# Remove system icons
npx crypto-mui-icon-cli remove --system Blockchain NFT

# Remove multiple types of icons at once
npx crypto-mui-icon-cli remove --token BTC --wallet MetaMask

# Specify the target directory containing icons to remove
npx crypto-mui-icon-cli remove --token BTC --dir ./src/libs/crypto-icons
```

If no options are specified, the tool will display an interactive menu for you to choose which icons to remove.

When you remove an icon, the following updates are made:

1. The icon component file is deleted
2. The export statement is removed from the respective index.ts file
3. The entry is removed from the corresponding enum (TokenName, WalletName, or SystemName)
4. The image path constant is removed from constants/imagePaths.ts
5. For tokens, the mapping is also removed from iconMappings.ts

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
