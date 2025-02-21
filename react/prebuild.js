import { mkdirSync, cpSync, existsSync } from "fs";

const source = "../node_modules/tailwindcss";
const destination = "node_modules/tailwindcss";

if (existsSync(source)) {
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
  console.log("TailwindCSS copied successfully.");
} else {
  console.log("TailwindCSS source not found, skipping copy.");
}
