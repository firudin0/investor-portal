import { getDb, ApplicationRecord } from "../db";

export type AdapterMode = "pull" | "push";

export function getAdapterMode(): AdapterMode {
  return process.env.INTERNAL_ADAPTER_MODE === "push" ? "push" : "pull";
}

function shouldPurgePii(): boolean {
  return process.env.PURGE_PII_ON_CONFIRM === "true";
}

export function purgePiiIfConfigured(appNumber: string) {
  if (!shouldPurgePii()) return;
  const db = getDb();
  db.prepare(
    `UPDATE applications SET
       description = '',
       applicant_name = '',
       voen = NULL,
       phone = '',
       email = '',
       region = '',
       amount_range = NULL,
       amount_exact = NULL,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE app_number = ?`
  ).run(appNumber);
}

export function markConfirmed(appNumber: string, internalRef: string | null) {
  const db = getDb();
  db.prepare(
    `UPDATE applications SET status = 'confirmed', internal_ref = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE app_number = ?`
  ).run(internalRef, appNumber);
  purgePiiIfConfigured(appNumber);
}

export function markSent(appNumber: string) {
  const db = getDb();
  db.prepare(
    `UPDATE applications SET status = 'sent', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE app_number = ?`
  ).run(appNumber);
}

export function markFailed(appNumber: string, error: string) {
  const db = getDb();
  db.prepare(
    `UPDATE applications SET status = 'failed', transfer_error = ?, transfer_attempts = transfer_attempts + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE app_number = ?`
  ).run(error, appNumber);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * PUSH mode only: sends one application to the internal portal's API.
 * Retries with linear backoff; on exhaustion the application is left in
 * 'failed' status ("göndərilmədi") for manual/automatic re-dispatch later.
 */
export async function pushApplication(app: ApplicationRecord): Promise<void> {
  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  const apiKey = process.env.INTERNAL_PUSH_API_KEY;
  const maxAttempts = Number(process.env.INTERNAL_PUSH_RETRY_MAX || 3);
  const retryDelayMs = Number(process.env.INTERNAL_PUSH_RETRY_DELAY_MS || 2000);

  if (!baseUrl || !apiKey) {
    markFailed(app.app_number, "INTERNAL_API_BASE_URL / INTERNAL_PUSH_API_KEY konfiqurasiya edilməyib");
    return;
  }

  let lastError = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": apiKey,
        },
        body: JSON.stringify(app),
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        throw new Error(lastError);
      }

      const data = (await response.json().catch(() => ({}))) as { internal_ref?: string };
      markConfirmed(app.app_number, data.internal_ref ?? null);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxAttempts) {
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  markFailed(app.app_number, lastError || "Naməlum xəta");
}

export async function retryFailedPushes(): Promise<void> {
  if (getAdapterMode() !== "push") return;
  const db = getDb();
  const failed = db
    .prepare("SELECT * FROM applications WHERE status = 'failed'")
    .all() as unknown as ApplicationRecord[];
  for (const app of failed) {
    await pushApplication(app);
  }
}
