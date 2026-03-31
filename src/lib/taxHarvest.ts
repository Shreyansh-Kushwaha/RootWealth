import type { PortfolioCreatePayload } from "@/types";
import { simulatePortfolio } from "@/lib/simulation";

const TAX_FREE_LIMIT = 125000;
const UNIT_PRECISION = 100000;

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString()}`;
}

function roundUnits(units: number) {
  return Math.floor(units * UNIT_PRECISION) / UNIT_PRECISION;
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

export async function getTaxHarvestRecommendation(
  portfolios: PortfolioCreatePayload[]
): Promise<TaxHarvestRecommendation> {
  const allLots: TaxHarvestLot[] = [];

  for (const portfolio of portfolios) {
    const simulation = await simulatePortfolio(portfolio);
    const latestNav = simulation.latestNav;

    const ltcgEntries = simulation.entries.filter(
      (entry) => entry.taxType === "LTCG" && latestNav > entry.nav
    );

    for (const entry of ltcgEntries) {
      const gainPerUnit = Math.max(0, latestNav - entry.nav);
      const potentialGain = entry.units * gainPerUnit;
      if (gainPerUnit <= 0 || potentialGain <= 0) continue;

      allLots.push({
        fundName: portfolio.fundName,
        schemeCode: portfolio.schemeCode,
        purchaseDate: entry.date,
        costPerUnit: entry.nav,
        currentNav: latestNav,
        unitsAvailable: entry.units,
        gainPerUnit,
        potentialGain,
        unitsToSell: 0,
        expectedGain: 0,
      });
    }
  }

  const unrealizedLtcg = allLots.reduce((sum, lot) => sum + lot.potentialGain, 0);
  const sortedLots = [...allLots].sort((a, b) => b.gainPerUnit - a.gainPerUnit);

  let remainingTaxFree = TAX_FREE_LIMIT;
  const selectedLots: TaxHarvestLot[] = [];
  let totalRecommendedGain = 0;
  let totalRecommendedUnits = 0;

  for (const lot of sortedLots) {
    if (remainingTaxFree <= 0) break;

    const fullLotGain = lot.potentialGain;
    if (fullLotGain <= remainingTaxFree) {
      selectedLots.push({
        ...lot,
        unitsToSell: roundUnits(lot.unitsAvailable),
        expectedGain: roundUnits(fullLotGain),
      });
      remainingTaxFree -= fullLotGain;
      totalRecommendedGain += fullLotGain;
      totalRecommendedUnits += lot.unitsAvailable;
      continue;
    }

    const sellUnits = roundUnits(remainingTaxFree / lot.gainPerUnit);
    if (sellUnits <= 0) break;

    selectedLots.push({
      ...lot,
      unitsToSell: Math.min(sellUnits, lot.unitsAvailable),
      expectedGain: roundUnits(sellUnits * lot.gainPerUnit),
    });
    totalRecommendedGain += sellUnits * lot.gainPerUnit;
    totalRecommendedUnits += sellUnits;
    remainingTaxFree -= sellUnits * lot.gainPerUnit;
    break;
  }

  const primaryRecommendation = selectedLots.length
    ? selectedLots.length === 1
      ? `Sell ${selectedLots[0].unitsToSell.toFixed(3)} units of ${selectedLots[0].fundName} before March 31 to harvest ${formatCurrency(selectedLots[0].expectedGain)} in tax-free gains.`
      : `Sell ${selectedLots[0].unitsToSell.toFixed(3)} units of ${selectedLots[0].fundName} and additional units from ${selectedLots[1].fundName} to use your ₹1.25L LTCG exemption.`
    : unrealizedLtcg === 0
    ? "You have no LTCG-eligible long-term units older than 365 days yet."
    : `Your total unrealized long-term gains are ${formatCurrency(unrealizedLtcg)}, below the ₹1.25L exemption limit.`;

  const note = unrealizedLtcg >= TAX_FREE_LIMIT
    ? "This recommendation is designed to keep your realized LTCG within the ₹1.25L tax-free window for the current financial year."
    : "Your total eligible LTCG is below the tax-free limit, so no larger harvest is required at this time.";

  return {
    unrealizedLtcg: Math.round(unrealizedLtcg),
    totalTaxFreeCapacity: TAX_FREE_LIMIT,
    recommendedGain: Math.round(totalRecommendedGain),
    recommendedUnits: Number(totalRecommendedUnits.toFixed(3)),
    recommendedLots: selectedLots,
    primaryRecommendation,
    note,
  };
}
