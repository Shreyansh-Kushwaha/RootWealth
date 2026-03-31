import axios from "axios";

export interface MfapiFundSummary {
  schemeCode: string;
  fundName: string;
}

interface MfapiFundApiEntry {
  schemeCode: string;
  schemeName: string;
  isinGrowth?: string;
  isinDivReinvestment?: string;
}

export interface MfapiNavEntry {
  date: string;
  nav: string;
}

export interface MfapiHistoryResponse {
  meta: {
    fund_house: string;
    scheme_code: string;
    fund_type: string;
    scheme_name: string;
  };
  data: MfapiNavEntry[];
}

function parseNavDate(dateString: string) {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function searchFunds(query: string) {
  const response = await axios.get<MfapiFundApiEntry[]>("https://api.mfapi.in/mf");
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected response from mfapi.in");
  }

  const normalized = query.trim().toLowerCase();
  const funds = response.data
    .map((fund) => ({
      schemeCode: fund.schemeCode,
      fundName: fund.schemeName,
    }))
    .filter((fund) => {
      if (!normalized) return true;
      return fund.fundName.toLowerCase().includes(normalized);
    });

  return funds.slice(0, 20);
}

export async function fetchNavHistory(schemeCode: string) {
  const response = await axios.get<MfapiHistoryResponse>(`https://api.mfapi.in/mf/${schemeCode}`);
  if (!response.data?.data?.length) {
    throw new Error(`Unable to fetch NAV data for scheme code ${schemeCode}`);
  }
  return response.data.data.map((entry) => ({
    date: parseNavDate(entry.date),
    nav: Number(entry.nav.replace(/,/g, "")),
  }));
}

export function findNavForDate(navHistory: { date: Date; nav: number }[], target: Date) {
  const sorted = [...navHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
  const normalizedTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return sorted.find((entry) => entry.date.getTime() >= normalizedTarget.getTime()) ?? null;
}

export function getLatestNav(navHistory: { date: Date; nav: number }[]) {
  const latest = navHistory.reduce((current, entry) =>
    current.date.getTime() > entry.date.getTime() ? current : entry,
  );
  return latest.nav;
}
