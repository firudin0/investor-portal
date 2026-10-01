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
