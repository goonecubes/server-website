// Copies the Ruffle Flash player from node_modules into public/apps/arcade/ruffle/ so the
// arcade page can load it from our own server. Runs before dev and build; the copy is
// gitignored (about 28 MB, mostly WebAssembly).
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@ruffle-rs", "ruffle");
const dest = join(root, "public", "apps", "arcade", "ruffle");

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const f of readdirSync(src)) {
	if (f.endsWith(".map") || f === "package.json" || f === "README.md") continue;
	cpSync(join(src, f), join(dest, f));
}
console.log("ruffle copied to public/apps/arcade/ruffle");
