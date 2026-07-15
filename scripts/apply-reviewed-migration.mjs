import { setDefaultResultOrder } from "node:dns";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

setDefaultResultOrder("verbatim");

const DRIZZLE_DIR = resolve(import.meta.dirname, "..", "drizzle");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

try {
  const files = readdirSync(DRIZZLE_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found in drizzle/");
    process.exit(0);
  }

  const last = files.at(-1);
  console.log(`Applying migration: ${last}`);

  const migrationSql = readFileSync(resolve(DRIZZLE_DIR, last), "utf8");
  await sql.unsafe(migrationSql);
  console.log("Migration applied successfully");
} finally {
  await sql.end();
}
