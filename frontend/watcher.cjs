/* eslint-disable @typescript-eslint/no-require-imports */

const chokidar = require("chokidar");
const { exec } = require("child_process");
const { config } = require("dotenv");

config({ path: ".env.local" });

// Default to openapi.json so a fresh checkout without .env.local still works.
const openapiFile = process.env.OPENAPI_OUTPUT_FILE || "openapi.json";
console.log(`Watching ${openapiFile} for changes to regenerate the client...`);
// Watch the specific file for changes
chokidar.watch(openapiFile).on("change", (path) => {
  console.log(`File ${path} has been modified. Running generate-client...`);
  exec("pnpm run generate-client", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
});
