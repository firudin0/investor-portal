export interface Incentive {
  id: string;
  name: string;
  description: string;
  sahe_tags: string[];
  keywords: string[];
  related_items: string[];
}

export interface ProgramItem {
  id: string;
  bend_no: string;
  title: string;
  text: string;
  netice: string;
  executor: string;
  executor_code: string;
  other_executors: string[];
  other_executor_codes: string;
  muddet: string;
  sahe_tags: string[];
  keywords: string[];
}

export interface SearchResult {
  query: string;
  incentives: Incentive[];
  programItems: ProgramItem[];
}

export interface ApplicationInput {
  field: string;
  amount_range?: string;
  amount_exact?: number;
  description: string;
  indicator: string;
  volume?: number;
  region: string;
  applicant_name: string;
  voen?: string;
  phone: string;
  email: string;
  consent: boolean;
  website?: string; // honeypot, must stay empty
}

export interface ApplicationResponse {
  app_number: string;
  status: string;
}

export interface ApiError {
  error: string;
  details?: { path: string; message: string }[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw data as ApiError;
  }
  return data as T;
}

export async function searchProgram(query: string): Promise<SearchResult> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return handleResponse<SearchResult>(response);
}

export async function submitApplication(
  input: ApplicationInput
): Promise<ApplicationResponse> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<ApplicationResponse>(response);
}

export async function fetchRegions(): Promise<string[]> {
  const response = await fetch("/regions.json");
  return handleResponse<string[]>(response);
}

export interface IndicatorRegion {
  region: string;
  n: number;
  amount: number;
  n_regions?: number;
}

export interface Indicator {
  key: string;
  title: string;
  section: string;
  prog_unit: string;
  data_unit: string;
  baza: number | null;
  hedef: number | null;
  baza_raw: string;
  hedef_raw: string;
  gap: number | null;
  n: number;
  potential: number;
  potential_verified: number;
  coverage: number | null;
  coverage_verified: number | null;
  by_region?: IndicatorRegion[];
  by_region_hidden?: boolean;
  review?: { n?: number; amount?: number; few?: boolean };
  planted_2026?: number | null;
  contest_ha?: number | null;
  concentrated?: boolean;
}

export interface IndicatorsData {
  meta: {
    generated: string;
    program: string;
    source: string;
    region_level: string;
    min_n: number;
    notes: string[];
  };
  indicators: Indicator[];
}

export async function fetchIndicators(): Promise<IndicatorsData> {
  const response = await fetch("/api/indicators");
  return handleResponse<IndicatorsData>(response);
}
