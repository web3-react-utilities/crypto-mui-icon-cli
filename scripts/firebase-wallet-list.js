/**
 * Script to fetch wallet names from Firebase Storage and update WALLETS.md and specialIcons.ts
 * Run with: node scripts/firebase-wallet-list.js
 */

const admin = require("firebase-admin");
const fs = require("fs-extra");
const path = require("path");

// Path to the files we'll update
const WALLETS_FILE_PATH = path.join(__dirname, "..", "WALLETS.md");
const SPECIAL_ICONS_PATH = path.join(__dirname, "..", "src", "utils", "specialIcons.ts");

// Path to service account key file
const serviceAccountPath = path.join(__dirname, "crypto-images-4545f-firebase-adminsdk-fbsvc-4e7b983716.json");

// Setup logging for better debugging
function log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    if (isError) {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
}

/**
 * Extracts wallet name from a file path or name
 * @param {string} filePath - Full file path or name
 * @returns {string} - Wallet name
 */
function extractWalletName(filePath) {
    // Get just the filename without the path
    const fileName = path.basename(filePath);

    log(`Processing file: ${fileName}`);

    // Extract wallet name based on file naming pattern
    // Case 1: Wallet with lightmode/darkmode variants (e.g., "MetaMask-lightmode.png" or "MetaMask-darkmode.png")
    const lightDarkModeMatch = fileName.match(/^([A-Za-z0-9]+)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) {
        return lightDarkModeMatch[1]; // Return just the wallet name part
    }

    // Case 2: Regular wallet (e.g., "MetaMask.png")
    const regularWalletMatch = fileName.match(/^([A-Za-z0-9]+)\.png$/);
    if (regularWalletMatch) {
        return regularWalletMatch[1];
    }

    // If no match, return null
    log(`Could not extract wallet name from: ${fileName}`, true);
    return null;
}

/**
 * Identifies if a wallet has light/dark mode variants
 * @param {string} walletName - The wallet name
 * @param {Array} allFileNames - All file names in the bucket
 * @returns {boolean} - Whether the wallet has light/dark variants
 */
function hasLightDarkModeVariants(walletName, allFileNames) {
    const lightModePattern = new RegExp(`^${walletName}-lightmode\\.png$`, "i");
    const darkModePattern = new RegExp(`^${walletName}-darkmode\\.png$`, "i");

    const hasLightMode = allFileNames.some((name) => lightModePattern.test(name));
    const hasDarkMode = allFileNames.some((name) => darkModePattern.test(name));

    if (hasLightMode && hasDarkMode) {
        log(`Wallet ${walletName} has both light and dark mode variants`);
        return true;
    }
    return false;
}

/**
 * Creates a formatted markdown table with 6 columns
 * @param {string[]} wallets - Array of wallet names
 * @param {string[]} specialWallets - Array of wallets with light/dark mode variants
 * @returns {string} - Markdown table
 */
function createMarkdownTable(wallets, specialWallets) {
    // Sort wallets alphabetically
    wallets.sort();

    log(`Creating table with ${wallets.length} wallets`);

    // Create groups of 6 wallets for the table
    const rows = [];
    for (let i = 0; i < wallets.length; i += 6) {
        const row = wallets.slice(i, i + 6);
        // Pad the row to always have 6 columns
        while (row.length < 6) {
            row.push("");
        }
        rows.push(row);
    } // Create the table markdown
    let tableMarkdown = "|       |       |       |       |       |       |\n";
    tableMarkdown += "| :------ | :------ | :------ | :------ | :------ | :------ |\n";

    rows.forEach((row) => {
        const formattedRow = row.map((wallet) => {
            if (wallet && specialWallets.includes(wallet)) {
                return `${wallet} 🌗`; // Add moon symbol to special wallets
            }
            return wallet;
        });
        tableMarkdown += `| ${formattedRow[0]} | ${formattedRow[1]} | ${formattedRow[2]} | ${formattedRow[3]} | ${formattedRow[4]} | ${formattedRow[5]} |\n`;
    });

    return tableMarkdown;
}

/**
 * Updates the WALLETS.md file with the new table and special wallets note
 * @param {string} tableContent - Markdown table content
 * @param {string[]} specialWallets - Array of wallets with light/dark mode variants
 */
async function updateWalletsFile(tableContent, specialWallets) {
    try {
        log("Reading WALLETS.md file...");
        // Read the current content of WALLETS.md
        const content = await fs.readFile(WALLETS_FILE_PATH, "utf8"); // Create the special wallets note
        const specialWalletsNote =
            specialWallets.length > 0
                ? `> **Note**: The wallets marked with 🌗 have different images for light and dark mode.`
                : "> **Note**: No wallets currently have special light/dark mode variants.";

        log("Updating table in WALLETS.md...");

        // Find the position of the table in the file
        const tableStartPos = content.indexOf("## Available Wallets");
        const tableEndPos = content.indexOf(">", tableStartPos);

        if (tableStartPos === -1 || tableEndPos === -1) {
            log("Could not find the table section in WALLETS.md", true);
            return;
        }

        // Create the new content by replacing the old table
        const beforeTable = content.substring(0, tableStartPos);
        const afterTable = content.substring(tableEndPos);
        const newTableSection = `## Available Wallets

Below is the complete list of all available wallet icons:

${tableContent}

${specialWalletsNote}
`;

        // Combine everything
        const updatedContent = beforeTable + newTableSection + afterTable;

        // Write the updated content back to the file
        await fs.writeFile(WALLETS_FILE_PATH, updatedContent, "utf8");
        log("WALLETS.md has been updated successfully!");

        // Log the first few wallets to verify
        const walletSample = [...specialWallets].slice(0, 5).join(", ");
        log(`Sample of wallets in the updated file: ${walletSample}...`);
    } catch (error) {
        log(`Error updating WALLETS.md: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Updates the specialIcons.ts file with the new special wallets list
 * @param {string[]} specialWallets - Array of wallets with light/dark mode variants
 */
async function updateSpecialIconsFile(specialWallets) {
    try {
        log("Reading specialIcons.ts file...");
        const content = await fs.readFile(SPECIAL_ICONS_PATH, "utf8");

        log("Updating specialWallets in specialIcons.ts...");

        // Format the wallets array with 5 wallets per line for better readability
        const formattedWalletsArray = [];
        for (let i = 0; i < specialWallets.length; i += 5) {
            const line = specialWallets
                .slice(i, i + 5)
                .map((wallet) => `"${wallet}"`)
                .join(", ");
            formattedWalletsArray.push(line);
        }

        const walletsArrayString = formattedWalletsArray.join(",\n  ");

        // Create the new specialWallets array content
        const newSpecialWallets = `export const specialWallets: string[] = [\n  ${walletsArrayString}\n];`;

        // Replace the existing specialWallets array using regex
        const specialWalletsRegex = /export const specialWallets: string\[\] = \[([\s\S]*?)\];/;
        const updatedContent = content.replace(specialWalletsRegex, newSpecialWallets);

        // Write the updated content back to the file
        await fs.writeFile(SPECIAL_ICONS_PATH, updatedContent, "utf8");
        log("specialIcons.ts has been updated successfully for wallets!");
    } catch (error) {
        log(`Error updating specialIcons.ts with wallets: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Main function to fetch wallet names and update WALLETS.md and specialIcons.ts
 */
async function fetchAndUpdateWallets() {
    try {
        log("Initializing Firebase connection...");
        if (!fs.existsSync(serviceAccountPath)) {
            log(`Service account file not found at: ${serviceAccountPath}`, true);
            return;
        }

        log("Loading service account...");
        const serviceAccount = require(serviceAccountPath);

        log("Initializing Firebase Admin...");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "crypto-images-wallet", // Wallet bucket name
        });

        log("Connecting to Firebase Storage bucket...");
        const bucket = admin.storage().bucket();

        // List files in the root directory since wallets are stored at the root level
        log("Fetching files from Firebase Storage root directory...");
        const [files] = await bucket.getFiles();

        log(`Found ${files.length} files in Firebase Storage`);

        if (files.length === 0) {
            log("No files found in the bucket", true);
            return;
        }

        // Get all file names for checking light/dark mode variants
        const allFileNames = files.map((file) => path.basename(file.name));

        // Extract unique wallet names
        const uniqueWallets = new Set();
        files.forEach((file) => {
            const walletName = extractWalletName(file.name);
            if (walletName) {
                uniqueWallets.add(walletName);
            }
        });

        // Identify special wallets with light/dark mode variants
        const specialWallets = [...uniqueWallets].filter((wallet) => hasLightDarkModeVariants(wallet, allFileNames));
        log(`Found ${uniqueWallets.size} unique wallets`);
        log(`Found ${specialWallets.length} wallets with light/dark mode variants: ${specialWallets.join(", ")}`);

        // Create the markdown table
        const tableContent = createMarkdownTable([...uniqueWallets], specialWallets);

        // Update the WALLETS.md file with the table and special wallets note
        await updateWalletsFile(tableContent, specialWallets);

        // Update the specialIcons.ts file with the special wallets list
        await updateSpecialIconsFile(specialWallets);

        log("Both WALLETS.md and specialIcons.ts files have been updated successfully for wallets!");
    } catch (error) {
        log(`Error in fetchAndUpdateWallets: ${error.message}`, true);
        console.error(error);
    }
}

// Main execution
log("Starting Firebase wallet list script...");
try {
    fetchAndUpdateWallets()
        .then(() => {
            log("Script completed successfully");
        })
        .catch((error) => {
            log(`Script failed with error: ${error.message}`, true);
            console.error(error);
        });
} catch (error) {
    log(`Unhandled error: ${error.message}`, true);
    console.error(error);
}
