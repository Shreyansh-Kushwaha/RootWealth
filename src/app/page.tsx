"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, ArrowUpRight, Moon, Plus, RefreshCcw, Sun, Trash2 } from "lucide-react";
import type { PortfolioDocument, PortfolioSimulation, TaxHarvestRecommendation, XirrResponse } from "@/types";

interface FundSearchResult {
  schemeCode: string;
  fundName: string;
}

interface NewInvestmentForm {
  fundName: string;
  schemeCode: string;
  investmentType: "SIP" | "LUMPSUM";
  amount: number;
  sipDate?: number;
  startDate: string;
}

interface SimulatedPortfolio extends PortfolioDocument {
  simulation: PortfolioSimulation;
}

interface OverlapResult {
  overlapPercent: number;
  common: string[];
  holdingsA: string[];
  holdingsB: string[];
}

export default function HomePage() {
  const [portfolios, setPortfolios] = useState<SimulatedPortfolio[]>([]);
  const [searchResults, setSearchResults] = useState<FundSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [overlapResult, setOverlapResult] = useState<OverlapResult | null>(null);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [taxHarvest, setTaxHarvest] = useState<TaxHarvestRecommendation | null>(null);
  const [taxHarvestLoading, setTaxHarvestLoading] = useState(false);
  const [xirr, setXirr] = useState<number | null>(null);
  const [xirrMessage, setXirrMessage] = useState<string | null>(null);
  const [xirrLoading, setXirrLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const { register, handleSubmit, watch, reset, setValue } = useForm<NewInvestmentForm>({
    defaultValues: {
      fundName: "",
      schemeCode: "",
      investmentType: "SIP",
      amount: 1000,
      sipDate: 1,
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const investmentType = watch("investmentType");

  const totals = useMemo(() => {
    const totalInvested = portfolios.reduce((sum, item) => sum + item.simulation.totalInvested, 0);
    const currentValue = portfolios.reduce((sum, item) => sum + item.simulation.currentValue, 0);
    const profit = currentValue - totalInvested;
    const ltcgValue = portfolios.reduce((sum, item) => sum + item.simulation.safeLtcgValue, 0);
    const profitPercent = totalInvested ? (profit / totalInvested) * 100 : 0;
    return { totalInvested, currentValue, profit, profitPercent, ltcgValue };
  }, [portfolios]);

  const chartData = [
    { name: "Invested", value: Math.round(totals.totalInvested) },
    { name: "Current", value: Math.round(totals.currentValue) },
  ];

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme") as "light" | "dark" | null;
    const preferDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme ?? (preferDark ? "dark" : "light");
    setTheme(initialTheme);
    fetchUser();
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setSearchResults(data || []))
      .catch(() => setSearchResults([]));

    return () => controller.abort();
  }, [searchQuery]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  async function fetchPortfolios() {
    setLoading(true);
    try {
      const response = await fetch("/api/portfolios");
      const data = (await response.json()) as SimulatedPortfolio[];
      setPortfolios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser() {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data?.authenticated) {
        setUserEmail(data.email ?? null);
        await refreshData();
      } else {
        setUserEmail(null);
        setPortfolios([]);
        setTaxHarvest(null);
        setXirr(null);
      }
    } catch (error) {
      console.error(error);
      setUserEmail(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchTaxHarvest() {
    setTaxHarvestLoading(true);
    try {
      const response = await fetch("/api/tax-harvest");
      const data = (await response.json()) as TaxHarvestRecommendation;
      if (data && !("error" in data)) {
        setTaxHarvest(data);
      } else {
        setTaxHarvest(null);
      }
    } catch (error) {
      console.error(error);
      setTaxHarvest(null);
    } finally {
      setTaxHarvestLoading(false);
    }
  }

  async function fetchXirr() {
    setXirrLoading(true);
    try {
      const response = await fetch("/api/xirr");
      const data = (await response.json()) as XirrResponse;
      if (data && !("error" in data)) {
        setXirr(data.xirr);
        setXirrMessage(data.message || "XIRR result available.");
      } else {
        setXirr(null);
        setXirrMessage("Unable to calculate XIRR.");
      }
    } catch (error) {
      console.error(error);
      setXirr(null);
      setXirrMessage("Unable to calculate XIRR.");
    } finally {
      setXirrLoading(false);
    }
  }

  async function refreshData() {
    await Promise.all([fetchPortfolios(), fetchTaxHarvest(), fetchXirr()]);
  }

  async function onSubmit(data: NewInvestmentForm) {
    setFormError(null);
    if (!data.fundName || !data.schemeCode) {
      setFormError("Select a valid fund from the search results.");
      return;
    }

    if (data.investmentType === "SIP" && (!data.sipDate || data.sipDate < 1 || data.sipDate > 31)) {
      setFormError("Please enter a valid SIP date between 1 and 31.");
      return;
    }

    try {
      await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      reset();
      setSearchResults([]);
      setSearchQuery("");
      await refreshData();
    } catch {
      setFormError("Unable to save investment. Please try again.");
    }
  }

  async function deletePortfolio(id: string) {
    await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
    await refreshData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserEmail(null);
    setPortfolios([]);
    setTaxHarvest(null);
    setXirr(null);
  }

  async function checkOverlap() {
    if (!selectedA || !selectedB) {
      setOverlapResult(null);
      return;
    }

    const response = await fetch("/api/overlap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fundA: selectedA, fundB: selectedB }),
    });
    const data = (await response.json()) as OverlapResult;
    setOverlapResult(data);
  }

  const activePortfolios = portfolios.filter((portfolio) => portfolio.isActive);

  return (
    <div>
      {/* FIX: Top Summary Section updated with accent border */}
      <section className="mb-8 rounded-3xl border-2 border-[color:var(--accent)] bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Mutual Fund Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">Privacy-first investor dashboard</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
              Add SIP or Lumpsum entries, simulate value using historical NAVs, and detect portfolio overlap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-surface bg-surface px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--accent)]"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]/90"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh data
            </button>
            {userEmail ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-surface bg-surface px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:border-rose-400 hover:text-rose-600"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]/90"
              >
                Login
              </a>
            )}
          </div>
        </div>

        {!authLoading && !userEmail && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-900">
            <p className="font-semibold text-rose-900">Your portfolio is private and requires login.</p>
            <p className="mt-2 text-[0.95rem] text-rose-700">Sign in to view your own SIP investments, tax harvest suggestions, and XIRR analytics.</p>
            <a
              href="/login"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              Go to login
            </a>
          </div>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-medium text-muted">Total Invested</p>
            <p className="mt-3 text-3xl font-semibold text-primary">₹{totals.totalInvested.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-medium text-muted">Current Value</p>
            <p className="mt-3 text-3xl font-semibold text-accent">₹{totals.currentValue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-medium text-muted">Overall Return</p>
            <p className={`mt-3 text-3xl font-semibold ${totals.profit >= 0 ? "text-accent" : "text-danger"}`}>
              {totals.profit >= 0 ? "₹" : "-₹"}{Math.abs(totals.profit).toLocaleString()} ({totals.profitPercent.toFixed(1)}%)
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-medium text-muted">XIRR</p>
            <p className="mt-3 text-3xl font-semibold text-primary">
              {xirrLoading ? "Loading…" : xirr !== null ? `${xirr.toFixed(2)}%` : "—"}
            </p>
            <p className="mt-2 text-sm text-muted">{xirrMessage ?? "Annualized portfolio return"}</p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-medium text-muted">LTCG Safe Zone</p>
            <p className="mt-3 text-3xl font-semibold text-accent">₹{totals.ltcgValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-surface bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">Tax-gain harvesting</h2>
              <p className="mt-1 text-sm text-muted">Use the ₹1.25L LTCG exemption before March 31 to maximize tax-free gains.</p>
            </div>
            <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-sm font-semibold text-[color:var(--accent)]">
              ₹1,25,000 tax-free cap
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl bg-[color:var(--card)] p-5">
              <p className="text-sm font-medium text-muted">Unrealized LTCG</p>
              <p className="mt-3 text-3xl font-semibold text-accent">
                {taxHarvestLoading ? "Loading..." : taxHarvest ? `₹${taxHarvest.unrealizedLtcg.toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--accent)]/20 p-5">
              <p className="text-sm font-medium text-muted">Recommendation</p>
              <p className="mt-3 text-base font-semibold text-primary">
                {taxHarvestLoading
                  ? "Checking your tax-free harvest recommendation..."
                  : taxHarvest?.primaryRecommendation ?? "No recommendation available at this time."}
              </p>
              {Number(taxHarvest?.recommendedLots?.length ?? 0) > 1 && (
                <p className="mt-3 text-sm text-muted">
                  This includes multiple funds to stay within the ₹1.25L exemption.
                </p>
              )}
              {taxHarvest && !taxHarvestLoading && (
                <p className="mt-3 text-sm text-muted">{taxHarvest.note}</p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          {/* FIX: Add Investment Section updated with accent border */}
          <section className="rounded-3xl border-2 border-[color:var(--accent)] bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-primary">Add new investment</h2>
                <p className="mt-1 text-sm text-muted">Search your fund, choose SIP or Lumpsum, and simulate performance.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--card)] px-4 py-2 text-sm text-[color:var(--foreground)]">
                <Plus className="h-4 w-4" /> Add investment
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">Fund name</label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("fundName")}
                  value={watch("fundName")}
                  onChange={(event) => {
                    setValue("fundName", event.target.value);
                    setSearchQuery(event.target.value);
                  }}
                  className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                  placeholder="Start typing a mutual fund name"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="rounded-3xl border border-surface bg-surface p-4">
                  <p className="mb-2 text-sm font-semibold text-muted">Select a fund</p>
                  <div className="grid gap-2">
                    {searchResults.map((result) => (
                      <button
                        type="button"
                        key={result.schemeCode}
                        onClick={() => {
                          setValue("fundName", result.fundName);
                          setValue("schemeCode", result.schemeCode);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="rounded-2xl bg-surface px-4 py-3 text-left text-sm text-[color:var(--foreground)] shadow-sm transition hover:bg-[color:var(--card)]"
                      >
                        <div className="font-medium">{result.fundName}</div>
                        <div className="text-muted">Scheme code: {result.schemeCode}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Scheme code</label>
                  <input
                    type="text"
                    {...register("schemeCode")}
                    className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                    placeholder="Selected scheme code"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Amount (₹)</label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Investment type</label>
                  <select
                    {...register("investmentType")}
                    className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                  >
                    <option value="SIP">SIP</option>
                    <option value="LUMPSUM">Lumpsum</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Start date</label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                  />
                </div>
                {investmentType === "SIP" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted">SIP date</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      {...register("sipDate", { valueAsNumber: true })}
                      className="w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                    />
                  </div>
                )}
              </div>

              {formError && <p className="text-sm text-rose-600">{formError}</p>}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--accent)]/90"
              >
                <Plus className="h-4 w-4" />
                Save investment
              </button>
            </form>
          </section>

          {/* FIX: Overlap Detective Section updated with accent border */}
          <section className="rounded-3xl border-2 border-[color:var(--accent)] bg-surface p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-primary">Overlap detective</h2>
                <p className="mt-1 text-sm text-muted">Select two funds to see top holding overlap.</p>
              </div>
              <button
                type="button"
                onClick={checkOverlap}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]/90"
              >
                <ArrowUpRight className="h-4 w-4" />
                Check overlap
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-muted">
                Fund A
                <select
                  value={selectedA}
                  onChange={(event) => setSelectedA(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="">Choose fund</option>
                  {activePortfolios.map((portfolio) => (
                    <option key={portfolio._id} value={portfolio.schemeCode}>
                      {portfolio.fundName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-muted">
                Fund B
                <select
                  value={selectedB}
                  onChange={(event) => setSelectedB(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="">Choose fund</option>
                  {activePortfolios.map((portfolio) => (
                    <option key={portfolio._id} value={portfolio.schemeCode}>
                      {portfolio.fundName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {overlapResult && (
              <div className="mt-6 rounded-3xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--warning)]">
                  <AlertTriangle className="h-4 w-4" />
                  {overlapResult.overlapPercent}% overlap detected
                </div>
                <p className="mt-2 text-sm text-muted">
                  Shared holdings: {overlapResult.common.join(", ") || "None"}.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-surface p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Fund A holdings</p>
                    <p className="mt-2">{overlapResult.holdingsA.join(", ")}</p>
                  </div>
                  <div className="rounded-3xl bg-surface p-4 text-sm text-muted">
                    <p className="font-semibold text-primary">Fund B holdings</p>
                    <p className="mt-2">{overlapResult.holdingsB.join(", ")}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* FIX: Portfolio Performance Section updated with accent border */}
        <section className="rounded-3xl border-2 border-[color:var(--accent)] bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-primary">Portfolio performance</h2>
              <p className="mt-1 text-sm text-muted">Review each investment and its current tax position.</p>
            </div>
            <div className="text-right text-sm text-muted">Updated automatically.</div>
          </div>

          <div className="mt-6 h-[320px] min-w-0 sm:h-[280px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => {
                      const displayValue = typeof value === "number" ? value : Number(value ?? 0);
                      return [`₹${displayValue.toLocaleString()}`, "Value"];
                    }}
                  />
                  <Bar dataKey="value" fill="#0f766e" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-3xl bg-[color:var(--card)]" />
            )}
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-surface">
            <table className="min-w-full divide-y divide-surface text-sm">
              <thead className="bg-surface text-left text-muted">
                <tr>
                  <th className="px-4 py-3">Fund</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Invested</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">LTCG safe</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface bg-surface">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={7}>Loading portfolios...</td>
                  </tr>
                ) : portfolios.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={7}>No investments yet.</td>
                  </tr>
                ) : (
                  portfolios.map((portfolio) => (
                    <tr key={portfolio._id} className="group hover:bg-[color:var(--card)]">
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-primary">{portfolio.fundName}</div>
                        <div className="text-xs text-muted">Start {new Date(portfolio.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4 align-top text-muted">{portfolio.investmentType}</td>
                      <td className="px-4 py-4 align-top text-muted">₹{portfolio.simulation.totalInvested.toLocaleString()}</td>
                      <td className="px-4 py-4 align-top text-emerald-700">₹{portfolio.simulation.currentValue.toFixed(0).toLocaleString()}</td>
                      <td className="px-4 py-4 align-top text-emerald-700">₹{portfolio.simulation.safeLtcgValue.toFixed(0).toLocaleString()}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${portfolio.simulation.profit >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {portfolio.simulation.profit >= 0 ? "Healthy" : "Review"}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => deletePortfolio(portfolio._id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-surface bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold text-muted transition hover:border-rose-300 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}