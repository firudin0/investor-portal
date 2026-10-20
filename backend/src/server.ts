import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { searchRouter } from "./routes/search";
import { applicationsRouter } from "./routes/applications";
import { internalRouter } from "./routes/internal";
import { internalAuth } from "./middleware/internalAuth";
import { searchRateLimit } from "./middleware/rateLimit";
import { getDb } from "./db";
import { retryFailedPushes, purgeConfirmedBacklog } from "./adapter/internalPortalAdapter";
import { startMockInternalPortal } from "./adapter/mockInternalPortal";

getDb();
// Ack edilmiş, amma şəxsi məlumatı hələ silinməmiş müraciətlər (köhnə versiyadan qalanlar).
purgeConfirmedBacklog();

const isProd = process.env.NODE_ENV === "production";
const app = express();
// Yalnız real proksi sayı qədər X-Forwarded-For-a etibar edilir (Render: 1). Lokal: heç biri,
// əks halda müştəri başlığı saxtalaşdırıb rate limit-i keçə bilər.
const trustProxy = Number(process.env.TRUST_PROXY || 0);
app.set("trust proxy", trustProxy > 0 ? trustProxy : false);
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "upgrade-insecure-requests": isProd ? [] : null,
      },
    },
    strictTransportSecurity: isProd,
  })
);
// Frontend eyni domendən verilir; CORS yalnız CORS_ORIGINS-də yazılan ünvanlara açılır.
const corsOrigins = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
const publicCors = corsOrigins.length ? cors({ origin: corsOrigins, methods: ["GET", "POST"] }) : (_req: Request, _res: Response, next: NextFunction) => next();
app.use(express.json({ limit: "100kb" }));

// Internal API: used only by the internal monitoring portal (PULL mode).
// Deliberately mounted on its own path, protected, never CORS-enabled and
// never referenced from the public routers below.
app.use("/api/internal", internalAuth, internalRouter);

// Public API: investor-facing, no auth, no access to internal-portal data.
app.use("/api", publicCors, searchRateLimit, searchRouter);
app.use("/api", publicCors, applicationsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Production: serve the built frontend from the same service (one domain).
const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(path.join(frontendDist, "index.html"))) {
  app.use(express.static(frontendDist));
  // Known SPA routes get 200; anything else gets the app's 404 page with a real 404 status (no soft 404s).
  const spaRoutes = new Set(["/", "/neticeler", "/muraciet", "/tesdiq"]);
  app.get(/^\/(?!api\/).*/, (req, res) =>
    res.status(spaRoutes.has(req.path.replace(/\/+$/, "") || "/") ? 200 : 404).sendFile(path.join(frontendDist, "index.html"))
  );
}

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Tapılmadı" });
});

// Xəta mətni və stack trace müştəriyə getmir, yalnız server loguna yazılır.
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Daxili xəta" : "Sorğu düzgün deyil" });
});

const port = Number(process.env.PORT || 4000);
// Defolt yalnız lokal. Render kimi hostinqdə HOST=0.0.0.0 təyin edilir.
const host = process.env.HOST || "127.0.0.1";
app.listen(port, host, () => {
  console.log(`investor-portal backend listening on ${host}:${port}`);
  // Demo: run the mock internal portal inside this same process.
  if (process.env.RUN_MOCK_INTERNAL === "true") startMockInternalPortal();
});

// PUSH mode: periodically retry applications left in 'failed' status.
const retryIntervalMs = Number(process.env.INTERNAL_PUSH_RETRY_INTERVAL_MS || 5 * 60 * 1000);
setInterval(() => {
  retryFailedPushes().catch((err) => console.error("retryFailedPushes error", err));
}, retryIntervalMs);
