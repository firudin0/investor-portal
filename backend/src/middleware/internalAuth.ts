import { NextFunction, Request, Response } from "express";

function clientIp(req: Request): string {
  // req.ip X-Forwarded-For-u yalnız server.ts-dəki "trust proxy" (TRUST_PROXY) qədər nəzərə alır.
  // Başlığın müştəri yazdığı sol elementinə birbaşa etibar edilmir.
  return req.ip || req.socket.remoteAddress || "";
}

function normalizeIp(ip: string): string {
  return ip.replace(/^::ffff:/, "");
}

export function internalAuth(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (!expectedKey) {
    res.status(503).json({ error: "Daxili inteqrasiya konfiqurasiya edilməyib" });
    return;
  }

  const providedKey = req.header("x-internal-api-key");
  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({ error: "Yanlış və ya olmayan API açarı" });
    return;
  }

  const whitelist = (process.env.INTERNAL_IP_WHITELIST || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (whitelist.length > 0) {
    const ip = normalizeIp(clientIp(req));
    if (!whitelist.includes(ip)) {
      res.status(403).json({ error: "Bu IP ünvanına icazə verilmir" });
      return;
    }
  }

  next();
}
