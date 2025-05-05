/**
 * Script to copy template files to dist directory
 */
const fs = require("fs-extra");
const path = require("path");

// Define paths
const templatesSrcDir = path.join(__dirname, "../src/templates");
const templatesDistDir = path.join(__dirname, "../dist/templates");

// Ensure the destination directory exists
fs.ensureDirSync(templatesDistDir);

// Copy all template directories
console.log("Copying templates to dist directory...");
fs.copySync(templatesSrcDir, templatesDistDir);

console.log("Templates copied successfully!");
