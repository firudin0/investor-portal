import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import regions from "../data/regions.json";

const regionSet = new Set(regions as string[]);

export const applicationSchema = z.object({
  field: z.string().trim().min(2).max(200),
  amount_range: z.string().trim().max(50).optional().nullable(),
  amount_exact: z.number().positive().max(1_000_000_000).optional().nullable(),
  description: z.string().trim().min(10).max(4000),
  region: z.string().refine((r) => regionSet.has(r), {
    message: "Naməlum region",
  }),
  applicant_name: z.string().trim().min(2).max(200),
  voen: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "VÖEN 10 rəqəmdən ibarət olmalıdır")
    .optional()
    .or(z.literal(""))
    .nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Telefon nömrəsi düzgün formatda deyil"),
  email: z.string().trim().email("E-poçt düzgün formatda deyil"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Şəxsi məlumatların işlənməsinə razılıq tələb olunur" }),
  }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// Honeypot: a field real investors never see or fill (hidden via CSS on the
// frontend). A bot that fills every field trips this. Rather than return a
// validation error (which would teach the bot which field to leave blank),
// respond as if the submission succeeded and silently drop it.
export function checkHoneypot(req: Request, res: Response, next: NextFunction) {
  const honeypotValue = req.body?.website;
  if (typeof honeypotValue === "string" && honeypotValue.length > 0) {
    const fakeNumber = `INV-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 999999)
    ).padStart(6, "0")}`;
    res.status(201).json({ app_number: fakeNumber, status: "pending" });
    return;
  }
  next();
}

export function validateApplication(req: Request, res: Response, next: NextFunction) {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Göndərilən məlumatlar düzgün deyil",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  req.body = parsed.data;
  next();
}
