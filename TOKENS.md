# Supported Tokens

This document lists all the cryptocurrency tokens supported by the Crypto MUI Icon CLI. You can add these tokens to your project using the `add` command.

```bash
npx crypto-mui-icon-cli@latest add --token TOKEN_NAME1 TOKEN_NAME2
```

## Available Tokens

Below is the complete list of all available token icons:

|           |         |        |        |         |        |
| :-------: | :-----: | :----: | :----: | :-----: | :----: |
|   AAVE    |  AELF   | AI16Z  |  AIRI  |  ALGO   |  APT   |
|    AR     |   ARB   |  ATI   |  ATOM  |  AVAX   |  AXS   |
| Aimstrong |   BNB   |  BONK  |  BTC   |  BTCB   |  BTT   |
|   BUSD    |  COMP   |  DAI   |  DOGE  |   EDU   |  ETH   |
|   FDUSD   |   FIL   | FLOKI  |  FLOW  |  FLUX   |  GALA  |
|    GNO    |  GNRT   |  GRT   |  HBAR  |   HNT   |  HOT   |
|    HT     |   HTX   |  IMX   |  INJ   |   ION   |  IOTX  |
|   JASMY   | JITOSOL |  JST   |  JUP   |   KAS   |  KCS   |
|    KWT    |   LEE   |  LTC   |  MANA  |   MAX   | METIS  |
|   MILKY   |  MINA   |  MKR   |  NEO   |  NEXO   |  NFT   |
|   NTMPI   |   OCH   |  ORAI  | ORAIX  |  OSMO   |  PEPE  |
|   PYTH    |  RACKS  |  ROSE  |  SHIB  |   SNX   |  SOL   |
|   STRX    | STUSDT  |  STX   |  SUN   | SUNOLD  |  TIA   |
|    TON    |  TRUMP  |  TRX   |  TUSD  |  USDAI  |  USDC  |
|   USDD    |  USDJ   |  USDT  |  VET   | VIRTUAL |  WBTC  |
|   WETH    |   WIF   |  WIN   |  XLM   |   XMR   |  XRP   |
|    ZEC    |   ZRX   | aUSDT  | sORAI  |  sSOL   | scATOM |
|   scINJ   | scORAI  | scOSMO | stATOM | stOSMO  |  xOCH  |

> **Note**: Some tokens like ALGO and HBAR have different images for light and dark mode.

## Using Tokens in Your Code

After adding a token icon to your project, you can use it as follows:

```jsx
import { IconBTC } from "./libs/crypto-icons/tokens";

function MyComponent() {
    return (
        <div>
            <h1>Bitcoin</h1>
            <IconBTC />

            {/* With MUI SvgIcon props */}
            <IconBTC fontSize="large" color="primary" />
        </div>
    );
}
```

## Adding New Tokens

If you need a token that is not listed here, please create an issue or pull request in our GitHub repository.
