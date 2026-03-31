const holdingsMap: Record<string, string[]> = {
  "120613": ["RELIANCE", "HDFC BANK", "TCS", "ICICI BANK", "INFOSYS", "HINDUNILVR", "KOTAK MAHINDRA BANK", "AXIS BANK", "SBIN", "LT"],
  "100029": ["HDFC BANK", "ICICI BANK", "RELIANCE", "AXIS BANK", "INFOSYS", "TITAN", "HINDUNILVR", "BHARTI AIRTEL", "ITC", "BAJAJ FINANCE"],
  "119129": ["RELIANCE", "INFOSYS", "TCS", "HDFC BANK", "ICICI BANK", "AXIS BANK", "HINDUNILVR", "SBIN", "LTI", "BAJAJ FINANCE"],
};

const fallbackHoldings = [
  "RELIANCE",
  "HDFC BANK",
  "TCS",
  "INFOSYS",
  "ICICI BANK",
  "HINDUNILVR",
  "AXIS BANK",
  "SBIN",
  "BAJAJ FINANCE",
  "BHARTI AIRTEL",
  "ITC",
  "LT",
  "MARUTI",
  "ONGC",
  "NESTLEIND",
  "SUN PHARMA",
  "KOTAK MAHINDRA BANK",
  "ULTRACEMCO",
  "TITAN",
  "GRASIM",
];

function generateMockHoldings(schemeCode: string) {
  const seed = schemeCode
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const holdings = [...fallbackHoldings];
  const selected: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    selected.push(holdings[(seed + i * 3) % holdings.length]);
  }
  return Array.from(new Set(selected)).slice(0, 12);
}

export function getFundHoldings(schemeCode: string) {
  return holdingsMap[schemeCode] ?? generateMockHoldings(schemeCode);
}

export function calculateOverlap(holdingsA: string[], holdingsB: string[]) {
  const setB = new Set(holdingsB);
  const common = holdingsA.filter((ticker) => setB.has(ticker));
  const overlapPercent = holdingsA.length
    ? Math.round((common.length / Math.min(holdingsA.length, holdingsB.length)) * 100)
    : 0;

  return {
    overlapPercent,
    common,
    holdingsA,
    holdingsB,
  };
}
