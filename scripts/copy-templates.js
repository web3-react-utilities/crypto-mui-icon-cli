const fs = require("fs-extra");
const path = require("path");

// Copy templates to dist folder after build
async function copyTemplates() {
    try {
        const srcTemplatesDir = path.join(__dirname, "..", "src", "templates");
        const distTemplatesDir = path.join(__dirname, "..", "dist", "templates");

        await fs.copy(srcTemplatesDir, distTemplatesDir);
        console.log("Templates copied successfully to dist folder");
    } catch (err) {
        console.error("Error copying templates:", err);
        process.exit(1);
    }
}

copyTemplates();
