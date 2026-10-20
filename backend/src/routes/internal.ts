import { Router } from "express";
import { getDb, ApplicationRecord } from "../db";
import { markSent, markConfirmed } from "../adapter/internalPortalAdapter";

// Mounted separately from the public /api routes in server.ts, behind
// internalAuth (API key + IP whitelist). Not linked from, or discoverable
// alongside, any public route.
export const internalRouter = Router();

internalRouter.get("/applications", (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "pending";
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM applications WHERE status = ? ORDER BY created_at ASC")
    .all(status) as unknown as ApplicationRecord[];

  // Fetching hands the batch to the internal portal; mark as 'sent' so a
  // retried GET (e.g. after a network blip) doesn't redeliver already
  // in-flight applications as 'pending'. Final confirmation still requires
  // an explicit ack call below.
  if (status === "pending") {
    for (const row of rows) markSent(row.app_number);
  }

  res.json({ applications: rows });
});

// Daxili paneldə rədd edilib 1 gün keçmiş müraciət: şəxsi məlumat tam silinir.
// Statistika üçün yalnız nömrə, alt-indikator, rədd tarixi və səbəb qalır.
internalRouter.post("/applications/:appNumber/reject-purge", (req, res) => {
  const { appNumber } = req.params;
  const body = req.body ?? {};
  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const rejectedAt = str(body.rejected_at, 40);
  if (!rejectedAt || Number.isNaN(Date.parse(rejectedAt))) {
    res.status(400).json({ error: "rejected_at lazımdır" });
    return;
  }
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE applications SET
         status = 'rejected', rejected_at = ?, reject_reason = ?, indicator = ?,
         field = '', description = '', region = '', applicant_name = '', voen = NULL, phone = '', email = '',
         amount_range = NULL, amount_exact = NULL, volume = NULL, consent = 0, routing_group = '',
         internal_ref = NULL, transfer_error = NULL,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE app_number = ?`
    )
    .run(rejectedAt, str(body.reason, 1000), str(body.indicator, 20), appNumber);
  if (result.changes === 0) {
    res.status(404).json({ error: "Müraciət tapılmadı" });
    return;
  }
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  res.json({ app_number: appNumber, status: "rejected" });
});

internalRouter.post("/applications/:appNumber/ack", (req, res) => {
  const { appNumber } = req.params;
  const internalRef = typeof req.body?.internal_ref === "string" ? req.body.internal_ref : null;

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM applications WHERE app_number = ?")
    .get(appNumber) as ApplicationRecord | undefined;

  if (!existing) {
    res.status(404).json({ error: "Müraciət tapılmadı" });
    return;
  }

  markConfirmed(appNumber, internalRef);
  res.json({ app_number: appNumber, status: "confirmed" });
});
