import fs from "fs";
import csv from "csv-parser";
import path from "path";

export async function parseCSV(filePath: string) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
        throw new Error(`CSV file not found: ${resolved}`);
    }

    const results: { Name: string; Sex: string }[] = [];

    return new Promise<{ Name: string; Sex: string }[]>((resolve, reject) => {
        fs.createReadStream(resolved)
            .pipe(
                csv({
                    mapHeaders: ({ header }) => (header || "").toString().trim().toLowerCase(),
                    skipLines: 0,
                })
            )
            .on("data", (data: Record<string, any>) => {
                const name = (data.name ?? data["name"] ?? "").toString().trim();
                const sex = (data.sex ?? data["sex"] ?? "").toString().trim();
                if (name && sex) results.push({ Name: name, Sex: sex });
            })
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
}