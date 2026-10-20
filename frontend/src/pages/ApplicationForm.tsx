import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, fetchRegions, submitApplication } from "../api/client";
import { usePageMeta } from "../seo";

const AMOUNT_RANGES = [
  { value: "0-50000", label: "0-50 000 AZN" },
  { value: "50000-200000", label: "50 000-200 000 AZN" },
  { value: "200000-1000000", label: "200 000-1 000 000 AZN" },
  { value: "1000000+", label: "1 000 000 AZN və yuxarı" },
];

// Must match backend/src/data/indicators.json (keys are validated on the backend).
const INDICATORS = [
  { key: "suvarma", label: "Müasir suvarma sistemləri tətbiq olunan sahələr", unit: "ha" },
  { key: "bag", label: "İntensiv meyvə bağlarının sahəsi", unit: "ha" },
  { key: "serab", label: "Kiçik şərabçılıq təsərrüfatları", unit: "ədəd" },
  { key: "xirda", label: "Xırdabuynuzlu heyvanlar", unit: "baş" },
  { key: "cins", label: "Cins heyvanlar (iribuynuzlu)", unit: "baş" },
  { key: "qus", label: "Quş əti istehsalı", unit: "ton" },
  { key: "none", label: "Bilmirəm / aid deyil", unit: null },
];

export default function ApplicationForm() {
  usePageMeta({
    title: "İnvestisiya niyyəti bildirişi",
    description: "Kənd təsərrüfatı sahəsində investisiya niyyətinizi Kənd Təsərrüfatı Nazirliyinə bildirin.",
    path: "/muraciet",
  });
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [regions, setRegions] = useState<string[]>([]);
  const [field, setField] = useState(params.get("field") ?? "");
  const [amountRange, setAmountRange] = useState(AMOUNT_RANGES[0].value);
  const [amountExact, setAmountExact] = useState("");
  const [description, setDescription] = useState("");
  const [indicator, setIndicator] = useState("");
  const [volume, setVolume] = useState("");
  const unit = INDICATORS.find((i) => i.key === indicator)?.unit ?? null;
  const [region, setRegion] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [voen, setVoen] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegions()
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await submitApplication({
        field,
        amount_range: amountRange,
        amount_exact: amountExact ? Number(amountExact) : undefined,
        description,
        indicator,
        volume: unit && volume ? Number(volume) : undefined,
        region,
        applicant_name: applicantName,
        voen: voen || undefined,
        phone,
        email,
        consent,
        website,
      });
      navigate("/tesdiq", { state: { appNumber: response.app_number } });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.details) {
        const next: Record<string, string> = {};
        for (const d of apiError.details) {
          next[d.path] = d.message;
        }
        setFieldErrors(next);
      }
      setFormError(apiError.error ?? "Müraciət göndərilmədi. Yenidən cəhd edin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="application-form-page">
      <h1>İnvestisiya niyyəti bildirişi</h1>
      <form onSubmit={handleSubmit} className="application-form">
        <label>
          Sahə / mövzu
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            required
          />
          {fieldErrors.field && <span className="field-error">{fieldErrors.field}</span>}
        </label>

        <div className="field-row">
          <label>
            Təxmini məbləğ (aralıq)
            <select value={amountRange} onChange={(e) => setAmountRange(e.target.value)}>
              {AMOUNT_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dəqiq məbləğ (AZN, məlumdursa)
            <input
              type="number"
              min="0"
              step="1"
              value={amountExact}
              onChange={(e) => setAmountExact(e.target.value)}
            />
            {fieldErrors.amount_exact && (
              <span className="field-error">{fieldErrors.amount_exact}</span>
            )}
          </label>
        </div>

        <label>
          İnvestisiya niyyətinin təsviri
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </label>

        <div className="field-row">
          <label>
            Alt-indikator
            <select value={indicator} onChange={(e) => setIndicator(e.target.value)} required>
              <option value="" disabled>
                Seçin...
              </option>
              {INDICATORS.map((i) => (
                <option key={i.key} value={i.key}>
                  {i.label}
                </option>
              ))}
            </select>
            {fieldErrors.indicator && <span className="field-error">{fieldErrors.indicator}</span>}
          </label>

          {unit && (
            <label>
              Planlaşdırılan əlavə həcm ({unit}, məlumdursa)
              <input
                type="number"
                min="0"
                step="any"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
              {fieldErrors.volume && <span className="field-error">{fieldErrors.volume}</span>}
            </label>
          )}
        </div>

        <label>
          Region
          <select value={region} onChange={(e) => setRegion(e.target.value)} required>
            <option value="" disabled>
              Seçin...
            </option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {fieldErrors.region && <span className="field-error">{fieldErrors.region}</span>}
        </label>

        <label>
          Ad, soyad / şirkət adı
          <input
            type="text"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            required
          />
          {fieldErrors.applicant_name && (
            <span className="field-error">{fieldErrors.applicant_name}</span>
          )}
        </label>

        <label>
          VÖEN (məlumdursa)
          <input type="text" value={voen} onChange={(e) => setVoen(e.target.value)} />
          {fieldErrors.voen && <span className="field-error">{fieldErrors.voen}</span>}
        </label>

        <label>
          Telefon
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+994 XX XXX XX XX"
            required
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>

        <label>
          E-poçt
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>

        {/* Honeypot: visually and from-tab-order hidden, but present in the DOM for bots that fill every field */}
        <div className="honeypot-wrap" aria-hidden="true">
          <label>
            Veb sayt
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          Şəxsi məlumatlarımın bu müraciətin işlənməsi üçün istifadəsinə razıyam.
        </label>
        {fieldErrors.consent && <span className="field-error">{fieldErrors.consent}</span>}

        {formError && <p className="error-text">{formError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Göndərilir..." : "Müraciəti göndər"}
        </button>
      </form>
    </section>
  );
}
