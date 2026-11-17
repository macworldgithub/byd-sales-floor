import { BASE_URL, fetchApi, getToken } from "./api";
export const API_BASE = BASE_URL;
export interface AppraisalMedia {
  id: string;
  kind: string;
  purpose: string;
  shot: string;
  name: string;
  contentType: string;
  bytes: number;
  sha256: string;
}
export interface Damage {
  panel: string;
  severity: string;
  description: string;
  estimatedRepairCost: number;
  source?: string;
  decision?: string;
  reviewNotes?: string;
}
export interface Appraisal {
  _id: string;
  appraisalId: string;
  leadId: string;
  customerId?: string;
  customerName: string;
  site: string;
  status: string;
  revision: number;
  rego?: string;
  state?: string;
  vin?: string;
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  odometer?: number;
  colour?: string;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  engine?: string;
  serviceHistory?: string;
  keys?: number;
  notes?: string;
  ppsrStatus: string;
  ppsrDetails?: {
    certificateNumber?: string;
    checkedAt?: string;
    verified?: boolean;
  };
  consultantName: string;
  updatedAt: string;
  condition: {
    exteriorRating?: number;
    interiorRating?: number;
    tyresRating?: number;
    mechanicalRating?: number;
    notes?: string;
    damagePoints?: Damage[];
  };
  valuation: Record<string, number>;
  media: AppraisalMedia[];
  missing: string[];
  dealId?: string;
  opportunityId?: string;
  deliveryId?: string;
  activeDriveId?: string;
  drives?: {
    id: string;
    driverName: string;
    startOdometer: number;
    endOdometer?: number;
    startedAt: string;
    endedAt?: string;
    distanceKm?: number;
    notes?: string;
  }[];
  loanCar?: {
    isSigned: boolean;
    loanCarRego: string;
    loanCarModel: string;
    signedBy: string;
    signedAt: string;
    returnedAt?: string;
    terms: string;
    signatureMediaId: string;
  };
  aiAssessment?: { at: string; findings: Damage[] };
  selectedOffer?: { partnerName: string; amount: number; invitationId: string };
}
export interface Partner {
  _id: string;
  kind: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  site: string;
  active: boolean;
  notes?: string;
  address?: string;
  licence?: string;
  abn?: string;
}
export interface Offer {
  _id: string;
  partnerName: string;
  company: string;
  expiresAt: string;
  status: string;
  revision: number;
  bid?: { amount: number; notes: string; submittedAt: string };
}
export interface Metadata {
  shots: string[];
  requiredShots: string[];
  statuses: string[];
  states: string[];
  providers: Record<string, { configured: boolean; reason?: string }>;
  damageAI: { configured: boolean };
}
export async function result<T>(
  request: Promise<{ success: boolean; data?: T; message?: string }>,
): Promise<T> {
  const response = await request;
  if (!response.success || response.data === undefined)
    throw new Error(response.message || "The request was not completed.");
  return response.data;
}
export const appraisalApi = {
  list: (query: Record<string, string>) =>
    fetchApi<Appraisal[]>(`/appraisals?${new URLSearchParams(query)}`),
  get: (id: string) =>
    result(fetchApi<Appraisal>(`/appraisals/${encodeURIComponent(id)}`)),
  metadata: () => result(fetchApi<Metadata>("/appraisals/metadata")),
  create: (input: unknown) =>
    result(
      fetchApi<Appraisal>("/appraisals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    ),
  save: (id: string, input: unknown) =>
    result(
      fetchApi<Appraisal>(`/appraisals/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    ),
  action: <T = Appraisal>(id: string, action: string, input: unknown) =>
    result(
      fetchApi<T>(`/appraisals/${encodeURIComponent(id)}/${action}`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    ),
  partners: (query: Record<string, string>) =>
    fetchApi<Partner[]>(`/appraisals/partners?${new URLSearchParams(query)}`),
  partner: (input: unknown, id?: string) =>
    result(
      fetchApi<Partner>(`/appraisals/partners${id ? `/${id}` : ""}`, {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      }),
    ),
  offers: (id: string) => result(fetchApi<Offer[]>(`/appraisals/${id}/offers`)),
  archive: (query: Record<string, string>) =>
    fetchApi<any[]>(`/appraisals/archive?${new URLSearchParams(query)}`),
  report: (site: string) =>
    result(
      fetchApi<{
        total: number;
        conversionRate: number | null;
        statuses: { status: string; count: number }[];
      }>(`/appraisals/report?${new URLSearchParams({ site })}`),
    ),
  async upload(id: string, file: Blob, query: Record<string, string>) {
    const response = await fetch(
      `${API_BASE}/appraisals/${id}/media?${new URLSearchParams(query)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": file.type || "application/octet-stream",
          "X-Site": localStorage.getItem("byd_floor_site") || "",
        },
        body: file,
      },
    );
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(data.message || "Upload failed.");
    return data.data as Appraisal;
  },
};
export async function privateMedia(
  id: string,
  publicInvite?: { id: string; token: string },
) {
  const endpoint = publicInvite
    ? `/appraisal-bids/${publicInvite.id}/media/${id}`
    : `/appraisals/media/${id}`;
  const headers: Record<string, string> = publicInvite
    ? { "X-Appraisal-Token": publicInvite.token }
    : {
        Authorization: `Bearer ${getToken()}`,
        "X-Site": localStorage.getItem("byd_floor_site") || "",
      };
  const response = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!response.ok) throw new Error("The attachment could not be loaded.");
  return URL.createObjectURL(await response.blob());
}
export async function downloadArchiveMedia(archiveId: string, mediaId: string, name: string) {
  const response = await fetch(`${API_BASE}/appraisals/archive/${encodeURIComponent(archiveId)}/media/${encodeURIComponent(mediaId)}`, {headers:{Authorization:`Bearer ${getToken()}`, 'X-Site':localStorage.getItem('byd_floor_site') || ''}});
  if(!response.ok) throw new Error('The archived attachment could not be downloaded.');
  const url=URL.createObjectURL(await response.blob()), link=document.createElement('a'); link.href=url; link.download=name; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function downloadJson(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
