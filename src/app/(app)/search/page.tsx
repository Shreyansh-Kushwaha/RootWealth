"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Search, ArrowRight } from "lucide-react";

interface FundResult {
  schemeCode: string;
  fundName: string;
}

interface RawHistoryEntry {
  date: string;
  nav: number;
}

interface HistoryEntry {
  date: Date;
  nav: number;
}

interface FundHistoryResponse {
  schemeCode: string;
  history: RawHistoryEntry[];
}

type RangeOption = "1M" | "3M" | "6M" | "1Y" | "MAX";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FundResult[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedRange, setSelectedRange] = useState<RangeOption>("6M");
  const [searchLoading, setSearchLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setResults([]);
          setSearchError(data?.error ?? "No funds found.");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSearchError("Unable to search funds.");
        }
      })
      .finally(() => setSearchLoading(false));

    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    if (!selectedFund) {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    fetch(`/api/fund-history?schemeCode=${encodeURIComponent(selectedFund.schemeCode)}`)
      .then((res) => res.json())
      .then((data: FundHistoryResponse | { error?: string }) => {
        if (Array.isArray((data as FundHistoryResponse).history)) {
          setHistory(
            (data as FundHistoryResponse).history
              .map((entry) => ({ date: new Date(entry.date), nav: entry.nav }))
              .sort((a, b) => a.date.getTime() - b.date.getTime())
          );
        } else {
          setHistory([]);
          setHistoryError((data as { error?: string }).error ?? "Unable to load history.");
        }
      })
      .catch(() => setHistoryError("Unable to load fund history."))
      .finally(() => setHistoryLoading(false));
  }, [selectedFund]);

  const filteredHistory = useMemo(() => {
    if (!history.length) return [];

    const anchorDate = history[history.length - 1].date;
    let cutoff = new Date(anchorDate);

    switch (selectedRange) {
      case "1M":
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
      case "3M":
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case "6M":
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case "1Y":
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      case "MAX":
      default:
        cutoff = new Date(0);
    }

    const rangeData = history.filter((entry) => entry.date >= cutoff);
    if (rangeData.length <= 120) {
      return rangeData;
    }

    const step = Math.ceil(rangeData.length / 120);
    return rangeData.filter((_, index) => index % step === 0 || index === rangeData.length - 1);
  }, [history, selectedRange]);

  const chartData = useMemo(
    () =>
      filteredHistory.map((entry) => ({
        date: entry.date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        nav: entry.nav,
      })),
    [filteredHistory]
  );

  return (
    <main className="min-h-screen bg-[color:var(--background)] px-4 py-6 text-[color:var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-surface bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Fund search</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">Search any SIP fund and view its historical trend</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
                Search by fund name and visualize the NAV trend across available history.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--card)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]">
              <Search className="h-4 w-4" /> Search funds
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-muted">
                Search SIP fund
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-surface bg-[color:var(--surface)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
                  placeholder="Type a mutual fund name or scheme code"
                />
              </label>

              {searchLoading && <p className="text-sm text-muted">Searching funds…</p>}
              {searchError && <p className="text-sm text-danger">{searchError}</p>}

              <div className="rounded-3xl border border-surface bg-[color:var(--card)] p-4">
                <p className="text-sm font-semibold text-muted">Search suggestions</p>
                <div className="mt-3 space-y-2">
                  {results.length === 0 ? (
                    <p className="text-sm text-muted">Start typing to see matching funds.</p>
                  ) : (
                    results.map((fund) => (
                      <button
                        key={fund.schemeCode}
                        type="button"
                        onClick={() => setSelectedFund(fund)}
                        className="w-full rounded-2xl border border-surface bg-surface px-4 py-3 text-left text-sm text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--accent)]"
                      >
                        <div className="font-semibold">{fund.fundName}</div>
                        <div className="text-xs text-muted">{fund.schemeCode}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-surface bg-[color:var(--card)] p-6 shadow-sm">
              <p className="text-sm font-semibold text-muted">Selected fund</p>
              <div className="mt-4 text-lg font-semibold text-primary">{selectedFund?.fundName ?? "No fund selected"}</div>
              {selectedFund && <p className="mt-1 text-sm text-muted">Scheme code: {selectedFund.schemeCode}</p>}
              <div className="mt-6 space-y-3 text-sm text-muted">
                <p>View historical NAV data after selecting a fund.</p>
                <p>Use this page to compare trends and identify SIP entry points with actual NAV history.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-surface bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">Fund NAV trend</h2>
              <p className="mt-1 text-sm text-muted">Historical NAV data for the selected scheme.</p>
            </div>
            {selectedFund && (
              <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-sm font-semibold text-[color:var(--accent)]">
                {selectedFund.schemeCode}
              </span>
            )}
          </div>

          {selectedFund && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              {(["1M", "3M", "6M", "1Y", "MAX"] as RangeOption[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedRange === range
                      ? "bg-[color:var(--accent)] text-white"
                      : "bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 min-h-[320px]">
            {historyLoading ? (
              <div className="flex h-full items-center justify-center rounded-3xl bg-[color:var(--card)] p-6 text-sm text-muted">Loading history...</div>
            ) : historyError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">{historyError}</div>
            ) : !selectedFund ? (
              <div className="flex h-full items-center justify-center rounded-3xl bg-[color:var(--card)] p-6 text-sm text-muted">Select a fund to view its trend.</div>
            ) : history.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-3xl bg-[color:var(--card)] p-6 text-sm text-muted">No historical data available for this fund.</div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-3xl bg-[color:var(--card)] p-6 text-sm text-muted">No history points match the selected range.</div>
            ) : (
              <div className="h-[320px] rounded-3xl border border-surface bg-[color:var(--card)] p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <span>{chartData.length} points shown</span>
                  <span>
                    Last NAV: ₹{chartData[chartData.length - 1]?.nav.toLocaleString()} on {filteredHistory[filteredHistory.length - 1]?.date.toLocaleDateString("en-IN")}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 12 }} interval={Math.max(0, Math.floor(chartData.length / 8))} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "NAV"]} />
                    <Line type="monotone" dataKey="nav" stroke="#0f766e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
