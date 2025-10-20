import { connectDB } from "./config/db";
import { fetchKaggleData } from "./services/kaggleService";
import { parseCSV } from "./services/csvService";
import { insertBabyNames } from "./services/dbService";

async function main() {
  await connectDB();
  await fetchKaggleData();
  const names = (await parseCSV("./data/babyNames.csv")) as any[];
  await insertBabyNames(names);
//   await sendToHubspot(names);
  console.log("Pipeline completed successfully.");
}

main();