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
