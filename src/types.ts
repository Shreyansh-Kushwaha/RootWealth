export type InvestmentType = "SIP" | "LUMPSUM";

export interface PortfolioCreatePayload {
  fundName: string;
  schemeCode: string;
  investmentType: InvestmentType;
  amount: number;
  sipDate?: number;
  startDate: string;
  isActive?: boolean;
}

export interface PortfolioDocument extends PortfolioCreatePayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PurchaseEntry {
  date: string;
  amount: number;
  nav: number;
  units: number;
  daysHeld: number;
  taxType: "LTCG" | "STCG";
}

export interface PortfolioSimulation {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  latestNav: number;
  profit: number;
  profitPercent: number;
  ltcgValue: number;
  stcgValue: number;
  safeLtcgValue: number;
  entries: PurchaseEntry[];
}

export interface SimulatedPortfolio extends PortfolioDocument {
  simulation: PortfolioSimulation;
}

export interface TaxHarvestLot {
  fundName: string;
  schemeCode: string;
  purchaseDate: string;
  costPerUnit: number;
  currentNav: number;
  unitsAvailable: number;
  gainPerUnit: number;
  potentialGain: number;
  unitsToSell: number;
  expectedGain: number;
}

export interface TaxHarvestRecommendation {
  unrealizedLtcg: number;
  totalTaxFreeCapacity: number;
  recommendedGain: number;
  recommendedUnits: number;
  recommendedLots: TaxHarvestLot[];
  primaryRecommendation: string;
  note: string;
}

export interface XirrCashFlow {
  amount: number;
  date: string;
}

export interface XirrResponse {
  xirr: number | null;
  message: string;
  cashFlowsCount: number;
  currentValue: number;
}
