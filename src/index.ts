import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fetchKaggleData } from "./services/kaggleService";
import { parseCSV } from "./services/csvService";

dotenv.config();

async function main() {
  try {
    console.log("Starting fetch...");
    await fetchKaggleData();

    const csvPath = path.resolve(process.cwd(), "data", "babyNames.csv");
    if (!fs.existsSync(csvPath)) {
      console.error("CSV file not found after download/extract:", csvPath);
      process.exit(1);
    }

    console.log("Parsing CSV...");
    const rows = await parseCSV(csvPath);
    console.log(`Parsed rows: ${rows.length}`);
    const sample = rows.slice(0, 5);
    console.log("Sample:", sample);
    console.log("Done.");
  } catch (err: any) {
    console.error("Error:", err?.message ?? err);
    process.exit(1);
  }
}

main();
