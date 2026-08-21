import fs from "node:fs";
import path from "node:path";
import { AGENT_PAGES } from "../src/lib/agent-content";

function markdownFilename(route: string) {
  if (route === "/") return "index.md";
  return `${route.replace(/^\//, "")}.md`;
}

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

for (const [route, page] of Object.entries(AGENT_PAGES)) {
  const filename = markdownFilename(route);
  const dest = path.join(publicDir, filename);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, page.markdown.trim() + "\n");
  console.log(`Wrote ${filename}`);
}
