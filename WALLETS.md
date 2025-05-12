# Supported Wallets

This document lists all the cryptocurrency wallets supported by the Crypto MUI Icon CLI. You can add these wallet icons to your project using the `add` command.

```bash
npx crypto-mui-icon-cli@latest add --wallet WALLET_NAME1 WALLET_NAME2
```

## Available Wallets

Below is the complete list of all available wallet icons:

|         |         |          |          |               |          |
| :------ | :------ | :------- | :------- | :------------ | :------- |
| Bitget  | Bybit   | Keplr    | Leap     | Ledger        | MetaMask |
| Owallet | Phantom | Solflare | TronLink | WalletConnect |          |

> **Note**: No wallets currently have special light/dark mode variants.

## Using System Icons in Your Code

After adding a system icon to your project, you can use it as follows:

```jsx
import { IconKelpr } from "./libs/crypto-icons/wallets";

function DeFiDashboard() {
    return (
        <div>
            <h2>Supported Wallet</h2>
            <div>
                <IconKelpr /> Kelpr
            </div>

            {/* With MUI SvgIcon props */}
            <IconKelpr fontSize="large" color="primary" />
        </div>
    );
}
```

## Adding New Wallets

If you need a wallet that is not listed here, please create an issue or pull request in our GitHub repository.
