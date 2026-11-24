import fs from "node:fs";
import path from "node:path";
import type { SeriesFile } from "./data";

export function readSeries(id: string): SeriesFile {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", `${id}.json`), "utf-8"));
}
