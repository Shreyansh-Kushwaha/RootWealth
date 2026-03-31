import { simulatePortfolio } from "@/lib/simulation";
import type { PortfolioCreatePayload } from "@/types";

export interface XirrCashFlow {
  amount: number;
  date: string;
}

export interface XirrCalculationResult {
  rate: number | null;
  message: string;
}

const YEAR_MS = 1000 * 60 * 60 * 24 * 365.25;

function dayFraction(startDate: Date, endDate: Date) {
  return (endDate.getTime() - startDate.getTime()) / YEAR_MS;
}

function xnpv(rate: number, cashFlows: XirrCashFlow[]) {
  const baseDate = new Date(cashFlows[0].date);
  return cashFlows.reduce((sum, cashFlow) => {
    const t = dayFraction(baseDate, new Date(cashFlow.date));
    return sum + cashFlow.amount / Math.pow(1 + rate, t);
  }, 0);
}

function xnpvDerivative(rate: number, cashFlows: XirrCashFlow[]) {
  const baseDate = new Date(cashFlows[0].date);
  return cashFlows.reduce((sum, cashFlow) => {
    const t = dayFraction(baseDate, new Date(cashFlow.date));
    return sum - (cashFlow.amount * t) / Math.pow(1 + rate, t + 1);
  }, 0);
}

export function calculateXirr(
  cashFlows: XirrCashFlow[],
  initialGuess = 0.1,
  tolerance = 1e-7,
  maxIterations = 100
): XirrCalculationResult {
  if (cashFlows.length < 2) {
    return { rate: null, message: "Need at least two cash flows to calculate XIRR." };
  }

  const sorted = [...cashFlows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const hasPositive = sorted.some((cashFlow) => cashFlow.amount > 0);
  const hasNegative = sorted.some((cashFlow) => cashFlow.amount < 0);

  if (!hasPositive || !hasNegative) {
    return { rate: null, message: "XIRR requires both investment and final positive cash flows." };
  }

  let rate = initialGuess;
  for (let i = 0; i < maxIterations; i += 1) {
    const value = xnpv(rate, sorted);
    const derivative = xnpvDerivative(rate, sorted);

    if (Math.abs(value) < tolerance) {
      return { rate, message: "XIRR calculation converged successfully." };
    }

    if (derivative === 0) {
      break;
    }

    const nextRate = rate - value / derivative;
    if (!Number.isFinite(nextRate)) {
      break;
    }

    if (Math.abs(nextRate - rate) < tolerance) {
      return { rate: nextRate, message: "XIRR calculation converged successfully." };
    }
    rate = nextRate;
  }

  return { rate: null, message: "XIRR calculation did not converge. Try again with different cash flows." };
}

export async function buildXirrCashFlows(portfolios: PortfolioCreatePayload[]): Promise<XirrCashFlow[]> {
  const cashFlows: XirrCashFlow[] = [];
  let totalCurrentValue = 0;

  for (const portfolio of portfolios) {
    const simulation = await simulatePortfolio(portfolio);
    const cashFlowDate = new Date();

    simulation.entries.forEach((entry) => {
      cashFlows.push({
        amount: -Math.round(entry.amount * 100) / 100,
        date: entry.date,
      });
    });

    totalCurrentValue += simulation.currentValue;
    cashFlows.push({
      amount: Math.round(simulation.currentValue * 100) / 100,
      date: cashFlowDate.toISOString().slice(0, 10),
    });
  }

  return cashFlows;
}
