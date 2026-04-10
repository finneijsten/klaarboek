"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type DashboardData = {
  total_income: number;
  total_expenses: number;
  btw_owed: number;
  profit: number;
  transaction_count: number;
};

type Transaction = {
  id: number;
  date: string;
  amount: number;
  description: string | null;
  counterparty: string | null;
  category: string | null;
  btw_rate: string | null;
  is_income: boolean;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
}

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [dashData, txData] = await Promise.all([
          api.getDashboard(),
          api.getTransactions(10),
        ]);
        setDashboard(dashData);
        setTransactions(txData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fout bij laden");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">Dashboard</h1>

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

          {dashboard && (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Inkomsten", value: formatCurrency(dashboard.total_income) },
                  { label: "Uitgaven", value: formatCurrency(dashboard.total_expenses) },
                  { label: "BTW schuld", value: formatCurrency(dashboard.btw_owed) },
                  { label: "Winst", value: formatCurrency(dashboard.profit) },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                    <p className="text-sm text-[#636E72] mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A2E]">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent transactions */}
              <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Recente transacties</h2>
                  <span className="text-sm text-[#636E72]">{dashboard.transaction_count} totaal</span>
                </div>

                {transactions.length === 0 ? (
                  <p className="text-sm text-[#636E72] py-8 text-center">
                    Nog geen transacties. Koppel je bankrekening om te beginnen.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#636E72] border-b border-[#E0DCD5]">
                        <th className="pb-3">Datum</th>
                        <th className="pb-3">Omschrijving</th>
                        <th className="pb-3">Categorie</th>
                        <th className="pb-3">BTW</th>
                        <th className="pb-3 text-right">Bedrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#E0DCD5] last:border-0">
                          <td className="py-3 text-sm text-[#636E72]">{formatDate(tx.date)}</td>
                          <td className="py-3 text-sm text-[#1A1A2E] font-medium">
                            {tx.counterparty || tx.description || "—"}
                          </td>
                          <td className="py-3">
                            {tx.category ? (
                              <span className="text-xs bg-[#EDEAE4] text-[#636E72] px-2 py-1 rounded-full">
                                {tx.category}
                              </span>
                            ) : (
                              <span className="text-xs text-[#636E72]">—</span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-[#636E72]">{tx.btw_rate || "—"}</td>
                          <td className={`py-3 text-sm text-right font-medium ${
                            tx.is_income ? "text-[#0D9668]" : "text-[#1A1A2E]"
                          }`}>
                            {tx.is_income ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
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
