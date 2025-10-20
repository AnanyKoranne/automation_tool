import { BabyName } from "../models/BabyName";

export async function insertBabyNames(rows: { Name: string; Sex: string }[]) {
  if (!Array.isArray(rows) || rows.length === 0) return;

  // Ensure table exists
  await BabyName.sync();

  const now = new Date();
  const records = rows.map((r) => ({ name: r.Name, sex: r.Sex, createdAt: now, updatedAt: now }));

  // Insert in batches to avoid large packet errors
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize);
    await BabyName.bulkCreate(chunk, { ignoreDuplicates: true });
  }
}