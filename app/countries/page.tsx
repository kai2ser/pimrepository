"use client";

import { useState, useMemo } from "react";
import { COUNTRIES_DATA } from "@/lib/countries-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function fmt(n: number, decimals = 1) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CountriesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRIES_DATA;
    return COUNTRIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso3.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public investment reference data for {COUNTRIES_DATA.length} countries
          (GDP &amp; public investment estimates, 2024). Sources: IMF World
          Economic Outlook (Oct 2024), World Bank, national statistics.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by country or ISO code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-10">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground w-16">ISO3</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                GDP 2024<br />
                <span className="font-normal text-xs">(USD Billions, Est.)</span>
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Public Inv. % of GDP<br />
                <span className="font-normal text-xs">(Est.)</span>
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Public Investment 2024<br />
                <span className="font-normal text-xs">(USD Billions, Est.)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No countries match &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.iso3} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                      {c.iso3}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(c.gdpBn)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmt(c.pubInvPctGdp * 100, 1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(c.pubInvBn, 2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {COUNTRIES_DATA.length} countries
        </p>
      )}
    </div>
  );
}
