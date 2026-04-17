import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const url = "https://primerisedrinks.com";

const options = {
  errorCorrectionLevel: "M",
  color: {
    dark: "#4f5c38",
    light: "#f4f1ea",
  },
};

const svg = await QRCode.toString(url, { type: "svg", ...options });
fs.writeFileSync(path.join(publicDir, "qr-primerisedrinks.svg"), svg, "utf8");

const pngBuffer = await QRCode.toBuffer(url, {
  type: "png",
  width: 512,
  margin: 2,
  ...options,
});
fs.writeFileSync(path.join(publicDir, "qr-primerisedrinks.png"), pngBuffer);

console.log("Wrote public/qr-primerisedrinks.svg and public/qr-primerisedrinks.png");
