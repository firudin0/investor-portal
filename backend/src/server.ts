import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { searchRouter } from "./routes/search";
import { applicationsRouter } from "./routes/applications";
import { internalRouter } from "./routes/internal";
import { internalAuth } from "./middleware/internalAuth";
import { searchRateLimit } from "./middleware/rateLimit";
import { getDb } from "./db";
import { retryFailedPushes } from "./adapter/internalPortalAdapter";
import { startMockInternalPortal } from "./adapter/mockInternalPortal";

getDb();

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Public API — investor-facing, no auth, no access to internal-portal data.
app.use("/api", searchRateLimit, searchRouter);
app.use("/api", applicationsRouter);

// Internal API — used only by the internal monitoring portal (PULL mode).
// Deliberately mounted on its own path, protected, and never referenced
// from the public routers above.
app.use("/api/internal", internalAuth, internalRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Production: serve the built frontend from the same service (one domain).
const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(path.join(frontendDist, "index.html"))) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(frontendDist, "index.html")));
}

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`investor-portal backend listening on :${port}`);
  // Demo: run the mock internal portal inside this same process.
  if (process.env.RUN_MOCK_INTERNAL === "true") startMockInternalPortal();
});

// PUSH mode: periodically retry applications left in 'failed' status.
const retryIntervalMs = Number(process.env.INTERNAL_PUSH_RETRY_INTERVAL_MS || 5 * 60 * 1000);
setInterval(() => {
  retryFailedPushes().catch((err) => console.error("retryFailedPushes error", err));
}, retryIntervalMs);
