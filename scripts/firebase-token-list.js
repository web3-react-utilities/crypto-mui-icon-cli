/**
 * Script to fetch token names from Firebase Storage and update TOKENS.md and specialIcons.ts
 * Run with: node scripts/firebase-token-list.js
 */

const admin = require("firebase-admin");
const fs = require("fs-extra");
const path = require("path");

// Path to the files we'll update
const TOKENS_FILE_PATH = path.join(__dirname, "..", "TOKENS.md");
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
 * Extracts token name from a file path or name
 * @param {string} filePath - Full file path or name
 * @returns {string} - Token name/symbol
 */
function extractTokenName(filePath) {
    // Get just the filename without the path
    const fileName = path.basename(filePath);

    log(`Processing file: ${fileName}`);

    // Extract token name based on file naming pattern
    // Case 1: Token with lightmode/darkmode variants (e.g., "ALGO-lightmode.png" or "ALGO-darkmode.png")
    const lightDarkModeMatch = fileName.match(/^([A-Z0-9]+)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) {
        return lightDarkModeMatch[1]; // Return just the token name part
    }

    // Case 2: Regular token (e.g., "AAVE.png")
    const regularTokenMatch = fileName.match(/^([A-Z0-9]+)\.png$/);
    if (regularTokenMatch) {
        return regularTokenMatch[1];
    }

    // If no match, return null
    log(`Could not extract token name from: ${fileName}`, true);
    return null;
}

/**
 * Identifies if a token has light/dark mode variants
 * @param {string} tokenName - The token name
 * @param {Array} allFileNames - All file names in the bucket
 * @returns {boolean} - Whether the token has light/dark variants
 */
function hasLightDarkModeVariants(tokenName, allFileNames) {
    const lightModePattern = new RegExp(`^${tokenName}-lightmode\\.png$`);
    const darkModePattern = new RegExp(`^${tokenName}-darkmode\\.png$`);

    const hasLightMode = allFileNames.some((name) => lightModePattern.test(name));
    const hasDarkMode = allFileNames.some((name) => darkModePattern.test(name));

    if (hasLightMode && hasDarkMode) {
        log(`Token ${tokenName} has both light and dark mode variants`);
        return true;
    }
    return false;
}

/**
 * Creates a formatted markdown table with 6 columns
 * @param {string[]} tokens - Array of token names
 * @returns {string} - Markdown table
 */
function createMarkdownTable(tokens) {
    // Sort tokens alphabetically
    tokens.sort();

    log(`Creating table with ${tokens.length} tokens`);

    // Create groups of 6 tokens for the table
    const rows = [];
    for (let i = 0; i < tokens.length; i += 6) {
        const row = tokens.slice(i, i + 6);
        // Pad the row to always have 6 columns
        while (row.length < 6) {
            row.push("");
        }
        rows.push(row);
    }

    // Create the table markdown
    let tableMarkdown = "|       |       |       |       |       |       |\n";
    tableMarkdown += "| :---: | :---: | :---: | :---: | :---: | :---: |\n";

    rows.forEach((row) => {
        tableMarkdown += `| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${row[4]} | ${row[5]} |\n`;
    });

    return tableMarkdown;
}

/**
 * Updates the TOKENS.md file with the new table and special tokens note
 * @param {string} tableContent - Markdown table content
 * @param {string[]} specialTokens - Array of tokens with light/dark mode variants
 */
async function updateTokensFile(tableContent, specialTokens) {
    try {
        log('Reading TOKENS.md file...');
        // Read the current content of TOKENS.md
        const content = await fs.readFile(TOKENS_FILE_PATH, 'utf8');
        
        // Create the special tokens note
        const specialTokensNote = specialTokens.length > 0 
          ? `> **Note**: The following tokens have different images for light and dark mode: ${specialTokens.join(', ')}.`
          : '> **Note**: No tokens currently have special light/dark mode variants.';
        
        log('Updating table in TOKENS.md...');
        
        // Find the position of the table in the file
        const tableStartPos = content.indexOf('## Available Tokens');
        const tableEndPos = content.indexOf('>', tableStartPos);
        
        if (tableStartPos === -1 || tableEndPos === -1) {
          log('Could not find the table section in TOKENS.md', true);
          return;
        }
        
        // Create the new content by replacing the old table
        const beforeTable = content.substring(0, tableStartPos);
        const afterTable = content.substring(tableEndPos);
        
        const newTableSection = `## Available Tokens

Below is the complete list of all available token icons:

${tableContent}
`;
        
        // Combine everything
        const updatedContent = beforeTable + newTableSection + afterTable;
        
        // Write the updated content back to the file
        await fs.writeFile(TOKENS_FILE_PATH, updatedContent, 'utf8');
        log('TOKENS.md has been updated successfully!');
        
        // Log the first few tokens to verify
        const tokenSample = [...specialTokens].slice(0, 5).join(', ');
        log(`Sample of tokens in the updated file: ${tokenSample}...`);
    } catch (error) {
        log(`Error updating TOKENS.md: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Updates the specialIcons.ts file with the new special tokens list
 * @param {string[]} specialTokens - Array of tokens with light/dark mode variants
 */
async function updateSpecialIconsFile(specialTokens) {
    try {
        log('Reading specialIcons.ts file...');
        const content = await fs.readFile(SPECIAL_ICONS_PATH, 'utf8');
        
        log('Updating specialTokens in specialIcons.ts...');
        
        // Format the tokens array with 5 tokens per line for better readability
        const formattedTokensArray = [];
        for (let i = 0; i < specialTokens.length; i += 5) {
            const line = specialTokens.slice(i, i + 5).map(token => `"${token}"`).join(", ");
            formattedTokensArray.push(line);
        }
        
        const tokensArrayString = formattedTokensArray.join(",\n  ");
        
        // Create the new specialTokens array content
        const newSpecialTokens = `export const specialTokens: string[] = [\n  ${tokensArrayString}\n];`;
        
        // Replace the existing specialTokens array using regex
        const specialTokensRegex = /export const specialTokens: string\[\] = \[([\s\S]*?)\];/;
        const updatedContent = content.replace(specialTokensRegex, newSpecialTokens);
        
        // Write the updated content back to the file
        await fs.writeFile(SPECIAL_ICONS_PATH, updatedContent, 'utf8');
        log('specialIcons.ts has been updated successfully!');
    } catch (error) {
        log(`Error updating specialIcons.ts: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Main function to fetch token names and update TOKENS.md and specialIcons.ts
 */
async function fetchAndUpdateTokens() {
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
            storageBucket: "crypto-images-token", // Bucket name
        });

        log("Connecting to Firebase Storage bucket...");
        const bucket = admin.storage().bucket();

        // List files in the root directory since tokens are stored at the root level
        log("Fetching files from Firebase Storage root directory...");
        const [files] = await bucket.getFiles();

        log(`Found ${files.length} files in Firebase Storage`);

        if (files.length === 0) {
            log("No files found in the bucket", true);
            return;
        }

        // Get all file names for checking light/dark mode variants
        const allFileNames = files.map((file) => path.basename(file.name));

        // Extract unique token names
        const uniqueTokens = new Set();
        files.forEach((file) => {
            const tokenName = extractTokenName(file.name);
            if (tokenName) {
                uniqueTokens.add(tokenName);
            }
        });

        // Identify special tokens with light/dark mode variants
        const specialTokens = [...uniqueTokens].filter((token) => hasLightDarkModeVariants(token, allFileNames));

        log(`Found ${uniqueTokens.size} unique tokens`);
        log(`Found ${specialTokens.length} tokens with light/dark mode variants: ${specialTokens.join(", ")}`);

        // Create the markdown table
        const tableContent = createMarkdownTable([...uniqueTokens]);

        // Update the TOKENS.md file with the table and special tokens note
        await updateTokensFile(tableContent, specialTokens);
        
        // Update the specialIcons.ts file with the special tokens list
        await updateSpecialIconsFile(specialTokens);
        
        log("Both TOKENS.md and specialIcons.ts files have been updated successfully!");
    } catch (error) {
        log(`Error in fetchAndUpdateTokens: ${error.message}`, true);
        console.error(error);
    }
}

// Main execution
log("Starting Firebase token list script...");
try {
    fetchAndUpdateTokens()
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
