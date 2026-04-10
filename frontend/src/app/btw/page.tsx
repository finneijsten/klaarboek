"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type BTWDeclaration = {
  id: number;
  year: number;
  quarter: number;
  total_income: number;
  total_expenses: number;
  btw_collected: number;
  btw_paid: number;
  btw_owed: number;
  status: string;
  submitted_at: string | null;
  created_at: string;
};

type BTWCalculation = {
  year: number;
  quarter: number;
  total_income: number;
  total_expenses: number;
  btw_collected: number;
  btw_paid: number;
  btw_owed: number;
  transaction_count: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

const QUARTER_LABELS = ["Q1 (jan-mrt)", "Q2 (apr-jun)", "Q3 (jul-sep)", "Q4 (okt-dec)"];

export default function BTWPage() {
  const router = useRouter();
  const [declarations, setDeclarations] = useState<BTWDeclaration[]>([]);
  const [calculation, setCalculation] = useState<BTWCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push("/login"); return; }
    fetchDeclarations();
  }, [router]);

  async function fetchDeclarations() {
    try {
      const data = await api.getBTWDeclarations();
      setDeclarations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculate() {
    setCalcLoading(true);
    setError(null);
    try {
      const data = await api.calculateBTW(selectedYear, selectedQuarter);
      setCalculation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij berekenen");
    } finally {
      setCalcLoading(false);
    }
  }

  async function handleSave() {
    if (!calculation) return;
    try {
      await api.saveBTWDeclaration(selectedYear, selectedQuarter);
      setCalculation(null);
      setLoading(true);
      await fetchDeclarations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">BTW-aangifte</h1>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9668]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Calculator */}
              <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6 mb-8">
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Berekening</h2>
                <div className="flex gap-4 items-end">
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">Jaar</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                    >
                      {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">Kwartaal</label>
                    <select
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                      className="px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                    >
                      {[1, 2, 3, 4].map((q) => (
                        <option key={q} value={q}>{QUARTER_LABELS[q - 1]}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleCalculate}
                    disabled={calcLoading}
                    className="px-6 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56] disabled:opacity-50"
                  >
                    {calcLoading ? "Berekenen..." : "Bereken BTW"}
                  </button>
                </div>

                {calculation && (
                  <div className="mt-6 border-t border-[#E0DCD5] pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-[#636E72]">Inkomsten</p>
                        <p className="text-lg font-bold text-[#1A1A2E]">{formatCurrency(calculation.total_income)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#636E72]">Uitgaven</p>
                        <p className="text-lg font-bold text-[#1A1A2E]">{formatCurrency(calculation.total_expenses)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#636E72]">BTW ontvangen</p>
                        <p className="text-lg font-bold text-[#1A1A2E]">{formatCurrency(calculation.btw_collected)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#636E72]">BTW betaald</p>
                        <p className="text-lg font-bold text-[#1A1A2E]">{formatCurrency(calculation.btw_paid)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-[#F5F3EF] rounded-xl p-4">
                      <div>
                        <p className="text-sm text-[#636E72]">BTW af te dragen</p>
                        <p className={`text-2xl font-bold ${calculation.btw_owed >= 0 ? "text-orange-500" : "text-[#0D9668]"}`}>
                          {formatCurrency(calculation.btw_owed)}
                        </p>
                        <p className="text-xs text-[#636E72] mt-1">
                          Gebaseerd op {calculation.transaction_count} transacties
                        </p>
                      </div>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A3E]"
                      >
                        Aangifte opslaan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Previous declarations */}
              <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Eerdere aangiftes</h2>
                {declarations.length === 0 ? (
                  <p className="text-sm text-[#636E72] py-8 text-center">
                    Nog geen aangiftes opgeslagen.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#636E72] border-b border-[#E0DCD5]">
                        <th className="pb-3">Periode</th>
                        <th className="pb-3 text-right">Inkomsten</th>
                        <th className="pb-3 text-right">Uitgaven</th>
                        <th className="pb-3 text-right">BTW af te dragen</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {declarations.map((dec) => (
                        <tr key={dec.id} className="border-b border-[#E0DCD5] last:border-0">
                          <td className="py-3 text-sm font-medium text-[#1A1A2E]">
                            {dec.year} {QUARTER_LABELS[dec.quarter - 1]}
                          </td>
                          <td className="py-3 text-sm text-right text-[#1A1A2E]">
                            {formatCurrency(dec.total_income)}
                          </td>
                          <td className="py-3 text-sm text-right text-[#1A1A2E]">
                            {formatCurrency(dec.total_expenses)}
                          </td>
                          <td className={`py-3 text-sm text-right font-medium ${
                            dec.btw_owed >= 0 ? "text-orange-500" : "text-[#0D9668]"
                          }`}>
                            {formatCurrency(dec.btw_owed)}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              dec.status === "submitted"
                                ? "bg-green-100 text-[#0D9668]"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {dec.status === "submitted" ? "Ingediend" : "Concept"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
