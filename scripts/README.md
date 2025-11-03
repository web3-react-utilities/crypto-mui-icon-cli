Liss of token, wallet, system craw from Github: https://github.com/devopstovchain/crypto-images-backend/tree/main/public/images

## Create github token to access private repos:

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic).
2. Click "Generate new token (classic)".
3. Chọn scope: repo (Full control of private repositories).
4. Generate và copy token

## Set GitHub Token:

```bash
# Windows CMD
set GITHUB_TOKEN=your_github_token_here

# Windows PowerShell
$env:GITHUB_TOKEN="your_github_token_here"

# Linux/Mac
export GITHUB_TOKEN=your_github_token_here
```

## Run Scripts:

```bash
GITHUB_TOKEN=your_token node scripts/firebase-token-list.js
GITHUB_TOKEN=your_token node scripts/firebase-wallet-list.js
GITHUB_TOKEN=your_token node scripts/firebase-system-list.js
```
