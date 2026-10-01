import { Router } from "express";
import { getDb, ApplicationRecord } from "../db";
import { applicationRateLimit } from "../middleware/rateLimit";
import { checkHoneypot, validateApplication, ApplicationInput } from "../middleware/validate";
import { nextApplicationNumber } from "../utils/appNumber";
import { resolveRoutingGroup } from "../utils/routing";
import { getAdapterMode, pushApplication } from "../adapter/internalPortalAdapter";

export const applicationsRouter = Router();

applicationsRouter.post("/applications", applicationRateLimit, checkHoneypot, validateApplication, (req, res) => {
  const input = req.body as ApplicationInput;
  const db = getDb();
  const appNumber = nextApplicationNumber();
  const routingGroup = resolveRoutingGroup(input.field);

  db.prepare(
    `INSERT INTO applications
      (app_number, field, amount_range, amount_exact, description, region,
       applicant_name, voen, phone, email, consent, routing_group, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).run(
    appNumber,
    input.field,
    input.amount_range ?? null,
    input.amount_exact ?? null,
    input.description,
    input.region,
    input.applicant_name,
    input.voen || null,
    input.phone,
    input.email,
    1,
    routingGroup
  );

  res.status(201).json({ app_number: appNumber, status: "pending" });

  if (getAdapterMode() === "push") {
    const record = db
      .prepare("SELECT * FROM applications WHERE app_number = ?")
      .get(appNumber) as unknown as ApplicationRecord;
    pushApplication(record).catch(() => {
      // failures are already persisted as status='failed' inside pushApplication
    });
  }
});

applicationsRouter.get("/applications/:appNumber/status", (req, res) => {
  const db = getDb();
  const row = db
    .prepare("SELECT app_number, status FROM applications WHERE app_number = ?")
    .get(req.params.appNumber);

  if (!row) {
    res.status(404).json({ error: "Müraciət tapılmadı" });
    return;
  }
  res.json(row);
});
