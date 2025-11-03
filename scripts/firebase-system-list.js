/**
 * Script to fetch system names from GitHub repository and update SYSTEMS.md and specialIcons.ts
 * Run with: node scripts/firebase-system-list.js
 */

const https = require("https");
const fs = require("fs-extra");
const path = require("path");

// Path to the files we'll update
const SYSTEMS_FILE_PATH = path.join(__dirname, "..", "SYSTEMS.md");
const SPECIAL_ICONS_PATH = path.join(__dirname, "..", "src", "utils", "specialIcons.ts");

// GitHub API configuration
const GITHUB_API_URL = "https://api.github.com/repos/devopstovchain/crypto-images-backend/contents/public/images/system";
const GITHUB_RAW_URL = "https://github.com/devopstovchain/crypto-images-backend/tree/main/public/images/system";

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
 * Extracts system name from a file path or name
 * @param {string} filePath - Full file path or name
 * @returns {string} - System name
 */
function extractSystemName(filePath) {
    // Get just the filename without the path
    const fileName = path.basename(filePath);

    log(`Processing file: ${fileName}`);

    // Extract system name based on file naming pattern
    // Case 1: System with lightmode/darkmode variants (e.g., "Jito-lightmode.png" or "Jito-darkmode.png")
    const lightDarkModeMatch = fileName.match(/^([A-Za-z0-9]+)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) {
        return lightDarkModeMatch[1]; // Return just the system name part
    }

    // Case 2: Regular system (e.g., "Uniswap.png")
    const regularSystemMatch = fileName.match(/^([A-Za-z0-9]+)\.png$/);
    if (regularSystemMatch) {
        return regularSystemMatch[1];
    }

    // If no match, return null
    log(`Could not extract system name from: ${fileName}`, true);
    return null;
}

/**
 * Identifies if a system has light/dark mode variants
 * @param {string} systemName - The system name
 * @param {Array} allFileNames - All file names in the bucket
 * @returns {boolean} - Whether the system has light/dark variants
 */
function hasLightDarkModeVariants(systemName, allFileNames) {
    const lightModePattern = new RegExp(`^${systemName}-lightmode\\.png$`, "i");
    const darkModePattern = new RegExp(`^${systemName}-darkmode\\.png$`, "i");

    const hasLightMode = allFileNames.some((name) => lightModePattern.test(name));
    const hasDarkMode = allFileNames.some((name) => darkModePattern.test(name));

    if (hasLightMode && hasDarkMode) {
        log(`System ${systemName} has both light and dark mode variants`);
        return true;
    }
    return false;
}

/**
 * Creates a formatted markdown table with 6 columns
 * @param {string[]} systems - Array of system names
 * @param {string[]} specialSystems - Array of systems with light/dark mode variants
 * @returns {string} - Markdown table
 */
function createMarkdownTable(systems, specialSystems) {
    // Sort systems alphabetically
    systems.sort();

    log(`Creating table with ${systems.length} systems`);

    // Create groups of 6 systems for the table
    const rows = [];
    for (let i = 0; i < systems.length; i += 6) {
        const row = systems.slice(i, i + 6);
        // Pad the row to always have 6 columns
        while (row.length < 6) {
            row.push("");
        }
        rows.push(row);
    } // Create the table markdown
    let tableMarkdown = "|       |       |       |       |       |       |\n";
    tableMarkdown += "| :------ | :------ | :------ | :------ | :------ | :------ |\n";

    rows.forEach((row) => {
        const formattedRow = row.map((system) => {
            if (system && specialSystems.includes(system)) {
                return `${system} 🌗`; // Add moon symbol to special systems
            }
            return system;
        });
        tableMarkdown += `| ${formattedRow[0]} | ${formattedRow[1]} | ${formattedRow[2]} | ${formattedRow[3]} | ${formattedRow[4]} | ${formattedRow[5]} |\n`;
    });

    return tableMarkdown;
}

/**
 * Updates the SYSTEMS.md file with the new table and special systems note
 * @param {string} tableContent - Markdown table content
 * @param {string[]} specialSystems - Array of systems with light/dark mode variants
 */
async function updateSystemsFile(tableContent, specialSystems) {
    try {
        log("Reading SYSTEMS.md file...");
        // Read the current content of SYSTEMS.md
        const content = await fs.readFile(SYSTEMS_FILE_PATH, "utf8"); // Create the special systems note
        const specialSystemsNote =
            specialSystems.length > 0
                ? `> **Note**: The systems marked with 🌗 have different images for light and dark mode.`
                : "> **Note**: No systems currently have special light/dark mode variants.";

        log("Updating table in SYSTEMS.md...");

        // Find the position of the table in the file
        const tableStartPos = content.indexOf("## Available Systems");
        const tableEndPos = content.indexOf(">", tableStartPos);

        if (tableStartPos === -1 || tableEndPos === -1) {
            log("Could not find the table section in SYSTEMS.md", true);
            return;
        }

        // Create the new content by replacing the old table
        const beforeTable = content.substring(0, tableStartPos);
        const afterTable = content.substring(tableEndPos);
        const newTableSection = `## Available Systems

Below is the complete list of all available system icons:

${tableContent}

${specialSystemsNote}
`;

        // Combine everything
        const updatedContent = beforeTable + newTableSection + afterTable;

        // Write the updated content back to the file
        await fs.writeFile(SYSTEMS_FILE_PATH, updatedContent, "utf8");
        log("SYSTEMS.md has been updated successfully!");

        // Log the first few systems to verify
        const systemSample = [...specialSystems].slice(0, 5).join(", ");
        log(`Sample of systems in the updated file: ${systemSample}...`);
    } catch (error) {
        log(`Error updating SYSTEMS.md: ${error.message}`, true);
        console.error(error);
    }
}

/**
 * Updates the specialIcons.ts file with the new special systems list
 * @param {string[]} specialSystems - Array of systems with light/dark mode variants
 */
async function updateSpecialIconsFile(specialSystems) {
    try {
        log("Reading specialIcons.ts file...");
        const content = await fs.readFile(SPECIAL_ICONS_PATH, "utf8");

        log("Updating specialSystems in specialIcons.ts...");

        // Format the systems array with 5 systems per line for better readability
        const formattedSystemsArray = [];
        for (let i = 0; i < specialSystems.length; i += 5) {
            const line = specialSystems
                .slice(i, i + 5)
                .map((system) => `"${system}"`)
                .join(", ");
            formattedSystemsArray.push(line);
        }

        const systemsArrayString = formattedSystemsArray.join(",\n  ");

        // Create the new specialSystems array content
        const newSpecialSystems = `export const specialSystems: string[] = [\n  ${systemsArrayString}\n];`;

        // Replace the existing specialSystems array using regex
        const specialSystemsRegex = /export const specialSystems: string\[\] = \[([\s\S]*?)\];/;
        const updatedContent = content.replace(specialSystemsRegex, newSpecialSystems);

        // Write the updated content back to the file
        await fs.writeFile(SPECIAL_ICONS_PATH, updatedContent, "utf8");
        log("specialIcons.ts has been updated successfully for systems!");
    } catch (error) {
        log(`Error updating specialIcons.ts with systems: ${error.message}`, true);
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
 * Main function to fetch system names and update SYSTEMS.md and specialIcons.ts
 */
async function fetchAndUpdateSystems() {
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

        // Extract unique system names
        const uniqueSystems = new Set();
        pngFiles.forEach((file) => {
            const systemName = extractSystemName(file.name);
            if (systemName) {
                uniqueSystems.add(systemName);
            }
        });

        // Identify special systems with light/dark mode variants
        const specialSystems = [...uniqueSystems].filter((system) => hasLightDarkModeVariants(system, allFileNames));
        log(`Found ${uniqueSystems.size} unique systems`);
        log(`Found ${specialSystems.length} systems with light/dark mode variants: ${specialSystems.join(", ")}`);

        // Create the markdown table
        const tableContent = createMarkdownTable([...uniqueSystems], specialSystems);

        // Update the SYSTEMS.md file with the table and special systems note
        await updateSystemsFile(tableContent, specialSystems);

        // Update the specialIcons.ts file with the special systems list
        await updateSpecialIconsFile(specialSystems);

        log("Both SYSTEMS.md and specialIcons.ts files have been updated successfully for systems!");
    } catch (error) {
        log(`Error in fetchAndUpdateSystems: ${error.message}`, true);
        console.error(error);
    }
}

// Main execution
log("Starting GitHub system list script...");
try {
    fetchAndUpdateSystems()
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
