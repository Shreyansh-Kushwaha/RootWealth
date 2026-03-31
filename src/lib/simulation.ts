import { fetchNavHistory, findNavForDate, getLatestNav } from "@/lib/mfapi";
import type { PortfolioCreatePayload, PortfolioSimulation, PurchaseEntry } from "@/types";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getNextBusinessDay(date: Date) {
  const result = new Date(date);
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

function getSipDates(startDate: Date, sipDate: number) {
  const values: Date[] = [];
  const now = new Date();
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= now) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const normalizedDay = Math.min(sipDate, daysInMonth(year, month));
    let candidate = new Date(year, month, normalizedDay);

    if (current.getMonth() === startDate.getMonth() && current.getFullYear() === startDate.getFullYear() && candidate < startDate) {
      candidate = new Date(startDate);
    }

    const actual = getNextBusinessDay(candidate);
    if (actual <= now && actual >= startDate) {
      values.push(actual);
    }
    current.setMonth(current.getMonth() + 1);
  }

  return values;
}

function createPurchaseEntry(date: Date, amount: number, nav: number) {
  const units = amount / nav;
  const now = new Date();
  const daysHeld = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return {
    date: date.toISOString().slice(0, 10),
    amount,
    nav,
    units,
    daysHeld,
    taxType: daysHeld > 365 ? "LTCG" : "STCG",
  } as PurchaseEntry;
}

export async function simulatePortfolio(portfolio: PortfolioCreatePayload) {
  const navHistory = await fetchNavHistory(portfolio.schemeCode);
  const latestNav = getLatestNav(navHistory);

  const purchases: PurchaseEntry[] = [];
  const startDate = new Date(portfolio.startDate);

  if (portfolio.investmentType === "LUMPSUM") {
    const purchaseDate = getNextBusinessDay(startDate);
    const navEntry = findNavForDate(navHistory, purchaseDate);
    if (!navEntry) {
      throw new Error("No NAV available for the selected purchase date.");
    }
    purchases.push(createPurchaseEntry(purchaseDate, portfolio.amount, navEntry.nav));
  } else {
    const sipDates = getSipDates(startDate, portfolio.sipDate ?? 1);
    for (const date of sipDates) {
      const navEntry = findNavForDate(navHistory, date);
      if (!navEntry) {
        continue;
      }
      purchases.push(createPurchaseEntry(date, portfolio.amount, navEntry.nav));
    }
  }

  const totalInvested = purchases.reduce((sum, entry) => sum + entry.amount, 0);
  const totalUnits = purchases.reduce((sum, entry) => sum + entry.units, 0);
  const currentValue = totalUnits * latestNav;
  const ltcgValue = purchases
    .filter((entry) => entry.taxType === "LTCG")
    .reduce((sum, entry) => sum + entry.units, 0) * latestNav;
  const stcgValue = purchases
    .filter((entry) => entry.taxType === "STCG")
    .reduce((sum, entry) => sum + entry.units, 0) * latestNav;

  return {
    totalInvested,
    currentValue,
    totalUnits,
    latestNav,
    profit: currentValue - totalInvested,
    profitPercent: totalInvested ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
    ltcgValue,
    stcgValue,
    safeLtcgValue: ltcgValue,
    entries: purchases,
  } as PortfolioSimulation;
}
