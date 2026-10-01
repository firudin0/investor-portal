import { getDb } from "../db";

export function nextApplicationNumber(): string {
  const year = new Date().getFullYear();
  const db = getDb();
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM applications WHERE app_number LIKE ?"
    )
    .get(`INV-${year}-%`) as { count: number };
  const seq = row.count + 1;
  return `INV-${year}-${String(seq).padStart(6, "0")}`;
}
