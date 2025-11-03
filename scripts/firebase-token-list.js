/**
 * Script to fetch token names from GitHub repository and update TOKENS.md and specialIcons.ts
 * Run with: node scripts/firebase-token-list.js
 */

const https = require("https");
const fs = require("fs-extra");
const path = require("path");

// Path to the files we'll update
const TOKENS_FILE_PATH = path.join(__dirname, "..", "TOKENS.md");
const SPECIAL_ICONS_PATH = path.join(__dirname, "..", "src", "utils", "specialIcons.ts");

// GitHub API configuration
const GITHUB_API_URL = "https://api.github.com/repos/devopstovchain/crypto-images-backend/contents/public/images/token";
const GITHUB_RAW_URL = "https://github.com/devopstovchain/crypto-images-backend/tree/main/public/images/token";

// GitHub token from environment variable or config
// Set via: export GITHUB_TOKEN=your_token_here
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

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

    // Case 1: Token with lightmode/darkmode variants (e.g., "ALGO-lightmode.png", "stOSMO-darkmode.png", "wstUSDT-lightmode.png", "UST-WORMHOLE-lightmode.png")
    const lightDarkModeMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) {
        return lightDarkModeMatch[1]; // Return just the token name part
    }

    // Case 2: Regular token (e.g., "AAVE.png", "stOSMO.png", "aUSDT.png", "UST-WORMHOLE.png")
    const regularTokenMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)\.png$/);
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
    // Need to escape special characters in the token name for regex
    const escapedTokenName = tokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const lightModePattern = new RegExp(`^${escapedTokenName}-lightmode\\.png$`, "i");
    const darkModePattern = new RegExp(`^${escapedTokenName}-darkmode\\.png$`, "i");

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
 * @param {string[]} specialTokens - Array of tokens with light/dark mode variants
 * @returns {string} - Markdown table
 */
function createMarkdownTable(tokens, specialTokens) {
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
    } // Create the table markdown
    let tableMarkdown = "|       |       |       |       |       |       |\n";
    tableMarkdown += "| :------ | :------ | :------ | :------ | :------ | :------ |\n";

    rows.forEach((row) => {
        const formattedRow = row.map((token) => {
            if (token && specialTokens.includes(token)) {
                return `${token} 🌗`; // Add moon symbol to special tokens
            }
            return token;
        });
        tableMarkdown += `| ${formattedRow[0]} | ${formattedRow[1]} | ${formattedRow[2]} | ${formattedRow[3]} | ${formattedRow[4]} | ${formattedRow[5]} |\n`;
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
        log("Reading TOKENS.md file...");
        // Read the current content of TOKENS.md
        const content = await fs.readFile(TOKENS_FILE_PATH, "utf8"); // Create the special tokens note
        const specialTokensNote =
            specialTokens.length > 0
                ? `> **Note**: The tokens marked with 🌗 have different images for light and dark mode.`
                : "> **Note**: No tokens currently have special light/dark mode variants.";

        log("Updating table in TOKENS.md...");

        // Find the position of the table in the file
        const tableStartPos = content.indexOf("## Available Tokens");
        const tableEndPos = content.indexOf(">", tableStartPos);

        if (tableStartPos === -1 || tableEndPos === -1) {
            log("Could not find the table section in TOKENS.md", true);
            return;
        } // Create the new content by replacing the old table
        const beforeTable = content.substring(0, tableStartPos);
        const afterTable = content.substring(tableEndPos);

        const newTableSection = `## Available Tokens

Below is the complete list of all available token icons:

${tableContent}

${specialTokensNote}
`;

        // Combine everything
        const updatedContent = beforeTable + newTableSection + afterTable;

        // Write the updated content back to the file
        await fs.writeFile(TOKENS_FILE_PATH, updatedContent, "utf8");
        log("TOKENS.md has been updated successfully!");

        // Log the first few tokens to verify
        const tokenSample = [...specialTokens].slice(0, 5).join(", ");
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
        log("Reading specialIcons.ts file...");
        const content = await fs.readFile(SPECIAL_ICONS_PATH, "utf8");

        log("Updating specialTokens in specialIcons.ts...");

        // Format the tokens array with 5 tokens per line for better readability
        const formattedTokensArray = [];
        for (let i = 0; i < specialTokens.length; i += 5) {
            const line = specialTokens
                .slice(i, i + 5)
                .map((token) => `"${token}"`)
                .join(", ");
            formattedTokensArray.push(line);
        }

        const tokensArrayString = formattedTokensArray.join(",\n  ");

        // Create the new specialTokens array content
        const newSpecialTokens = `export const specialTokens: string[] = [\n  ${tokensArrayString}\n];`;

        // Replace the existing specialTokens array using regex
        const specialTokensRegex = /export const specialTokens: string\[\] = \[([\s\S]*?)\];/;
        const updatedContent = content.replace(specialTokensRegex, newSpecialTokens);

        // Write the updated content back to the file
        await fs.writeFile(SPECIAL_ICONS_PATH, updatedContent, "utf8");
        log("specialIcons.ts has been updated successfully!");
    } catch (error) {
        log(`Error updating specialIcons.ts: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Fetches data from GitHub API
 * @param {string} url - GitHub API URL
 * @returns {Promise<Object>} - JSON response
 */
function fetchFromGitHub(url) {
    return new Promise((resolve, reject) => {
        const headers = {
            "User-Agent": "crypto-icons-cli",
            Accept: "application/vnd.github.v3+json",
        };

        // Add authorization token if provided
        if (GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
            log("Using GitHub token for authentication");
        } else {
            log("Warning: No GitHub token provided. This may fail for private repositories.", true);
            log("Set GITHUB_TOKEN environment variable to authenticate.");
        }

        const options = {
            headers: headers,
        };

        https
            .get(url, options, (res) => {
                let data = "";

                // Check for authentication errors
                if (res.statusCode === 401) {
                    reject(new Error("Authentication failed. Please check your GitHub token."));
                    return;
                }

                if (res.statusCode === 404) {
                    reject(new Error("Repository not found or you don't have access to it."));
                    return;
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`GitHub API returned status code: ${res.statusCode}`));
                    return;
                }

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(new Error(`Failed to parse GitHub response: ${error.message}`));
                    }
                });
            })
            .on("error", (error) => {
                reject(new Error(`GitHub API request failed: ${error.message}`));
            });
    });
}

/**
 * Main function to fetch token names and update TOKENS.md and specialIcons.ts
 */
async function fetchAndUpdateTokens() {
    try {
        log("Connecting to GitHub repository...");
        log(`Fetching files from: ${GITHUB_API_URL}`);

        // Fetch files from GitHub API
        const files = await fetchFromGitHub(GITHUB_API_URL);

        if (!Array.isArray(files)) {
            log("Invalid response from GitHub API", true);
            return;
        }

        log(`Found ${files.length} files in GitHub repository`);

        if (files.length === 0) {
            log("No files found in the repository", true);
            return;
        }

        // Filter only PNG files
        const pngFiles = files.filter((file) => file.name.endsWith(".png"));
        log(`Found ${pngFiles.length} PNG files`);

        // Get all file names for checking light/dark mode variants
        const allFileNames = pngFiles.map((file) => file.name);

        // Extract unique token names
        const uniqueTokens = new Set();
        pngFiles.forEach((file) => {
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
        const tableContent = createMarkdownTable([...uniqueTokens], specialTokens);

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
log("Starting GitHub token list script...");
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
