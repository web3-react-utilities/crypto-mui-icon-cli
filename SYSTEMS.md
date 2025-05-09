# Supported Systems

This document lists all the blockchain systems supported by the Crypto MUI Icon CLI. You can add these system icons to your project using the `add` command.

```bash
npx crypto-mui-icon-cli@latest add --system SYSTEM_NAME1 SYSTEM_NAME2
```

## Available Systems

Below is the complete list of all available system icons:

|     |      |             |        |        |     |
| :-: | :--: | :---------: | :----: | :----: | :-: |
| BSC | Jito | JustLendDAO | Kamino | Orchai |     |

> **Note**: Some systems like Jito, JustLendDAO, Kamino, and Orchai have different images for light and dark mode.

## Using System Icons in Your Code

After adding a system icon to your project, you can use it as follows:

```jsx
import { IconUniswap } from "./libs/crypto-icons/systems";

function DeFiDashboard() {
    return (
        <div>
            <h2>Supported Protocols</h2>
            <div>
                <IconUniswap /> Uniswap
            </div>

            {/* With MUI SvgIcon props */}
            <IconUniswap fontSize="large" color="primary" />
        </div>
    );
}
```

## Adding New Systems

If you need a system that is not listed here, please create an issue or pull request in our GitHub repository.
