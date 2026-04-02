"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { PortfolioDocument, PortfolioSimulation } from "@/types";

interface SimulatedPortfolio extends PortfolioDocument {
  simulation: PortfolioSimulation;
}

export default function SipsPage() {
  const [portfolios, setPortfolios] = useState<SimulatedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortfolios() {
      setLoading(true);
      try {
        const response = await fetch("/api/portfolios");
        const data = await response.json();
        if (response.ok) {
          setPortfolios(data);
        } else {
          setError(data?.error ?? "Unable to fetch portfolios.");
        }
      } catch (err) {
        setError("Unable to load the SIP dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolios();
  }, []);

  const totalInvested = useMemo(() => portfolios.reduce((sum, portfolio) => sum + portfolio.simulation.totalInvested, 0), [portfolios]);
  const totalValue = useMemo(() => portfolios.reduce((sum, portfolio) => sum + portfolio.simulation.currentValue, 0), [portfolios]);

  function getChartData(portfolio: SimulatedPortfolio) {
    let cumulativeInvested = 0;
    let cumulativeUnits = 0;
    return portfolio.simulation.entries.map((entry) => {
      cumulativeInvested += entry.amount;
      cumulativeUnits += entry.units;
      return {
        date: new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }),
        invested: Number(cumulativeInvested.toFixed(2)),
        currentValue: Number((cumulativeUnits * portfolio.simulation.latestNav).toFixed(2)),
      };
    });
  }

  return (
    <main className="min-h-screen bg-[color:var(--background)] px-4 py-6 text-[color:var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-surface bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">SIP analytics</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">SIP timeline and portfolio data</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
                Review every SIP investment, chart the purchase schedule, and compare contribution history with current value.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-[color:var(--card)] p-5">
              <p className="text-sm font-medium text-muted">Total SIP/Lumpsum plans</p>
              <p className="mt-3 text-3xl font-semibold text-primary">{portfolios.length}</p>
            </div>
            <div className="rounded-3xl bg-[color:var(--card)] p-5">
              <p className="text-sm font-medium text-muted">Total invested</p>
              <p className="mt-3 text-3xl font-semibold text-accent">₹{totalInvested.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-[color:var(--card)] p-5">
              <p className="text-sm font-medium text-muted">Current portfolio value</p>
              <p className="mt-3 text-3xl font-semibold text-accent">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-surface bg-surface p-6 text-center text-sm text-muted shadow-sm">Loading SIP details...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-900 shadow-sm">{error}</div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-3xl border border-surface bg-surface p-6 text-center text-sm text-muted shadow-sm">No SIPs or funds found yet.</div>
        ) : (
          <div className="space-y-6">
            {portfolios.map((portfolio) => (
              <section key={portfolio._id} className="rounded-3xl border border-surface bg-surface p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-primary">{portfolio.fundName}</h2>
                    <p className="mt-1 text-sm text-muted">{portfolio.schemeCode} • {portfolio.investmentType}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-muted">Latest NAV</p>
                    <p className="text-lg font-semibold text-accent">₹{portfolio.simulation.latestNav.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-[color:var(--card)] p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Total invested</p>
                    <p className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">₹{portfolio.simulation.totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-[color:var(--card)] p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Current value</p>
                    <p className="mt-3 text-lg font-semibold text-accent">₹{portfolio.simulation.currentValue.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-[color:var(--card)] p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Total units</p>
                    <p className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">{portfolio.simulation.totalUnits.toFixed(3)}</p>
                  </div>
                  <div className="rounded-3xl bg-[color:var(--card)] p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Profit</p>
                    <p className={`mt-3 text-lg font-semibold ${portfolio.simulation.profit >= 0 ? "text-accent" : "text-danger"}`}>
                      ₹{portfolio.simulation.profit.toFixed(0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData(portfolio)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Value"]} />
                      <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 12 }} />
                      <Line type="monotone" dataKey="invested" name="Cumulative invested" stroke="#475569" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="currentValue" name="Current value" stroke="#0f766e" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 overflow-x-auto rounded-3xl border border-surface bg-[color:var(--card)] p-4">
                  <div className="text-sm font-semibold text-primary">Investment history</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {portfolio.simulation.entries.map((entry) => (
                      <div key={`${portfolio._id}-${entry.date}-${entry.nav}`} className="rounded-3xl border border-surface bg-surface p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">{new Date(entry.date).toLocaleDateString()}</p>
                        <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">₹{entry.amount.toLocaleString()} @ ₹{entry.nav.toFixed(2)}</p>
                        <p className="mt-1 text-sm text-muted">Units: {entry.units.toFixed(4)}</p>
                        <p className="text-sm text-muted">Tax type: {entry.taxType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
