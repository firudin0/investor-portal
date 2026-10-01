import "dotenv/config";
import express from "express";

// Stands in for the real, not-yet-specified internal monitoring portal, so
// both adapter modes can be exercised end to end in development.
//
// PUSH mode: runs a receiver on MOCK_INTERNAL_PORT that the open backend's
// internalPortalAdapter.pushApplication() posts to.
//
// PULL mode: runs a poller that calls the open backend's protected
// GET /api/internal/applications?status=pending on an interval, then acks
// each one via POST /api/internal/applications/:appNumber/ack.

export function startMockInternalPortal() {
  const mode = process.env.INTERNAL_ADAPTER_MODE === "push" ? "push" : "pull";
  const failRate = Number(process.env.MOCK_FAIL_RATE || 0);

  function logStep(msg: string) {
    console.log(`[mock-internal-portal:${mode}] ${msg}`);
  }

  if (mode === "push") {
    const app = express();
    app.use(express.json());

    app.post("/applications", (req, res) => {
      if (Math.random() < failRate) {
        logStep(`simulated failure for ${req.body?.app_number}`);
        res.status(503).json({ error: "internal portal unavailable (simulated)" });
        return;
      }
      const internalRef = `MON-${Date.now()}`;
      logStep(`received ${req.body?.app_number}, ack as ${internalRef}`);
      res.json({ internal_ref: internalRef });
    });

    const port = Number(process.env.MOCK_INTERNAL_PORT || 4100);
    app.listen(port, () => logStep(`listening on :${port}`));
  } else {
    const openBackendUrl = process.env.OPEN_BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const apiKey = process.env.INTERNAL_API_KEY || "";
    const pollIntervalMs = Number(process.env.MOCK_POLL_INTERVAL_MS || 5000);

    async function pollOnce() {
      try {
        const response = await fetch(`${openBackendUrl}/api/internal/applications?status=pending`, {
          headers: { "x-internal-api-key": apiKey },
        });
        if (!response.ok) {
          logStep(`poll failed: HTTP ${response.status}`);
          return;
        }
        const data = (await response.json()) as { applications: { app_number: string }[] };
        for (const app of data.applications) {
          const internalRef = `MON-${Date.now()}`;
          const ackResponse = await fetch(
            `${openBackendUrl}/api/internal/applications/${app.app_number}/ack`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-api-key": apiKey,
              },
              body: JSON.stringify({ internal_ref: internalRef }),
            }
          );
          if (ackResponse.ok) {
            logStep(`pulled and acked ${app.app_number} as ${internalRef}`);
          } else {
            logStep(`ack failed for ${app.app_number}: HTTP ${ackResponse.status}`);
          }
        }
      } catch (err) {
        logStep(`poll error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    logStep(`polling ${openBackendUrl} every ${pollIntervalMs}ms`);
    setInterval(pollOnce, pollIntervalMs);
    pollOnce();
  }
}

if (require.main === module) {
  startMockInternalPortal();
}
