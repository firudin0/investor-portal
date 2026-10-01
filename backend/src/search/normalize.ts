const FOLD_MAP: Record<string, string> = {
  ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g",
  Ə: "e", İ: "i", I: "i", Ö: "o", Ü: "u", Ş: "s", Ç: "c", Ğ: "g",
};

export function foldAz(input: string): string {
  return input
    .split("")
    .map((ch) => FOLD_MAP[ch] ?? ch)
    .join("")
    .toLowerCase();
}

export function normalize(input: string): string {
  return foldAz(input.trim()).replace(/\s+/g, " ");
}
