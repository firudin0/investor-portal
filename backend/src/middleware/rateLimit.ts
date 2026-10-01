import rateLimit from "express-rate-limit";

export const applicationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Həddindən çox müraciət göndərildi. Zəhmət olmasa bir az sonra yenidən cəhd edin." },
});

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Axtarış sorğularının limiti aşıldı. Bir az sonra yenidən cəhd edin." },
});
