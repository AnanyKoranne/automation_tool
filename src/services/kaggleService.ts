import { chromium, Browser } from "playwright";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// adm-zip has no bundled TypeScript types in this project; require it and ignore type errors
// @ts-ignore
const AdmZip = require("adm-zip");

dotenv.config();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function findCsvRecursive(dir: string): string | null {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const found = findCsvRecursive(full);
      if (found) return found;
    } else if (stat.isFile() && entry.toLowerCase().endsWith(".csv")) {
      return full;
    }
  }
  return null;
}

export async function fetchKaggleData() {
  const dataDir = path.resolve(process.cwd(), "data");
  ensureDir(dataDir);

  let browser: Browser | undefined;
  try {
    const headless = process.env.PW_HEADLESS !== "false";
    const slowMo = process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0;
    browser = await chromium.launch({ headless, slowMo });
    // enable downloads in the context so page.waitForEvent('download') works reliably
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    console.log("Navigating to Kaggle login...");
    await page.goto(
      "https://www.kaggle.com/account/login?phase=emailSignIn&returnUrl=%2Fdatasets%2Fthedevastator%2Fus-baby-names-by-year-of-birth",
      { waitUntil: "load", timeout: 60000 }
    );

    const email = process.env.KAGGLE_EMAIL;
    const pass = process.env.KAGGLE_PASSWORD;
    if (!email || !pass) throw new Error("KAGGLE_EMAIL or KAGGLE_PASSWORD not set in environment");

    await page.waitForSelector('input[name="email"], input[id="email"]', { timeout: 15000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', pass);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {}),
      page.click('button[type="submit"], button:has-text("Sign In")'),
    ]);
    await page.waitForTimeout(2000);

    if (page.url().includes("/account/login") || page.url().includes("twoFactor")) {
      throw new Error("Login failed or requires 2FA/captcha. Run headful to inspect.");
    }

    console.log("Logged in successfully. Navigating to dataset page...");
    await page.goto(
      "https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv",
      { waitUntil: "load", timeout: 60000 }
    );

    await page.waitForTimeout(1500);

    console.log("Locating and clicking Download button...");
    const downloadBtn = await page.$('button:has-text("Download"), button[aria-label="Download"]');
    if (!downloadBtn) throw new Error("Could not find main Download button on dataset page.");

    await downloadBtn.click();
    await page.waitForTimeout(500);

    const optionSelectors = [
      'text=Download dataset',
      'a:has-text("Download dataset")',
      'a:has-text("Download")',
      'text=Download',
    ];

    let optionHandle: any = null;
    for (const sel of optionSelectors) {
      optionHandle = await page.$(sel);
      if (optionHandle) break;
    }
    if (!optionHandle) optionHandle = await page.$('a[href*="download"], a[href*="downloads"]');
    if (!optionHandle) throw new Error("Could not find download option in the dropdown.");

    console.log("Waiting for ZIP download to start...");
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 120000 }),
      optionHandle.click(),
    ]);

    const zipPath = path.join(dataDir, "dataset.zip");
    await download.saveAs(zipPath);
    console.log(`Download completed: ${zipPath}`);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(dataDir, true);

    const csvPath = findCsvRecursive(dataDir);
    if (csvPath) {
      const finalCsvPath = path.join(dataDir, "babyNames.csv");
      if (path.resolve(csvPath) !== path.resolve(finalCsvPath)) {
        if (fs.existsSync(finalCsvPath)) fs.unlinkSync(finalCsvPath);
        fs.renameSync(csvPath, finalCsvPath);
      }
      console.log(`Extracted CSV file: ${finalCsvPath}`);
    } else {
      console.error("No CSV file found inside extracted archive.");
    }
  } catch (err: any) {
    console.error("Error in fetchKaggleData:", err?.message ?? err);
    throw err;
  } finally {
    if (browser) await browser.close();
    console.log("Process complete.");
  }
}
