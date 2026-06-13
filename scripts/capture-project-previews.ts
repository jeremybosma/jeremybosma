import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";

const OUTPUT_DIR = path.resolve("public/projects/previews");
const VIEWPORT = { width: 1280, height: 720 };

const PROJECTS = [
  { slug: "individu", url: "https://individu.ai" },
  { slug: "internet-engineering", url: "https://internet-engineering.com" },
  { slug: "integrate", url: "https://integrate.dev" },
  { slug: "fulldev", url: "https://full.dev" },
] as const;

async function dismissOverlays(page: Page) {
  const dismissSelectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Agree")',
    'button:has-text("Got it")',
    'button:has-text("OK")',
    'button:has-text("Close")',
    '[aria-label="Close"]',
    '[data-testid="cookie-accept"]',
  ];

  for (const selector of dismissSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
      await button.click({ timeout: 1000 }).catch(() => undefined);
      await page.waitForTimeout(300);
    }
  }
}

async function waitForSettled(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
}

async function captureViewport(page: Page, outputPath: string) {
  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 86,
    fullPage: false,
  });
}

async function captureProject(slug: string, url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await waitForSettled(page);
    await dismissOverlays(page);

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = VIEWPORT.height;
    const scrollSteps = [
      0,
      Math.min(viewportHeight, Math.max(0, scrollHeight - viewportHeight) * 0.35),
      Math.min(viewportHeight * 2, Math.max(0, scrollHeight - viewportHeight) * 0.7),
    ];

    for (let index = 0; index < scrollSteps.length; index++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollSteps[index]);
      await page.waitForTimeout(700);
      const outputPath = path.join(OUTPUT_DIR, `${slug}-${index + 1}.jpg`);
      await captureViewport(page, outputPath);
      console.log(`Saved ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });

for (const project of PROJECTS) {
  console.log(`Capturing ${project.url}...`);
  await captureProject(project.slug, project.url);
}

console.log("Done.");
