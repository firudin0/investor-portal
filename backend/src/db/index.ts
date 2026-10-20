import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;

  const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "..", "data.sqlite");
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  // Silinən şəxsi məlumat faylda köhnə səhifələrdə qalmasın.
  db.exec("PRAGMA secure_delete = ON");

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  db.exec(schema);

  // Columns added after the first release: add them to databases created by the old schema.
  const cols = new Set((db.prepare("PRAGMA table_info(applications)").all() as { name: string }[]).map((c) => c.name));
  if (!cols.has("indicator")) db.exec("ALTER TABLE applications ADD COLUMN indicator TEXT");
  if (!cols.has("volume")) db.exec("ALTER TABLE applications ADD COLUMN volume REAL");
  if (!cols.has("rejected_at")) db.exec("ALTER TABLE applications ADD COLUMN rejected_at TEXT");
  if (!cols.has("reject_reason")) db.exec("ALTER TABLE applications ADD COLUMN reject_reason TEXT");

  return db;
}

export type ApplicationStatus = "pending" | "sent" | "confirmed" | "failed" | "rejected";

export interface ApplicationRecord {
  id: number;
  app_number: string;
  field: string;
  amount_range: string | null;
  amount_exact: number | null;
  description: string;
  region: string;
  applicant_name: string;
  voen: string | null;
  phone: string;
  email: string;
  consent: number;
  routing_group: string;
  indicator: string | null;
  volume: number | null;
  rejected_at: string | null;
  reject_reason: string | null;
  status: ApplicationStatus;
  transfer_attempts: number;
  transfer_error: string | null;
  internal_ref: string | null;
  created_at: string;
  updated_at: string;
}

if (require.main === module) {
  const database = getDb();
  const count = database.prepare("SELECT COUNT(*) as c FROM applications").get() as { c: number };
  console.log(`applications table ready, ${count.c} row(s)`);
}
