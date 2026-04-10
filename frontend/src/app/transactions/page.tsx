"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Transaction = {
  id: number;
  date: string;
  amount: number;
  description: string | null;
  counterparty: string | null;
  category: string | null;
  btw_rate: string | null;
  is_business: boolean;
  is_income: boolean;
  classified_by: string;
};

const CATEGORIES = [
  "Omzet", "Materiaal", "Kantoor", "Transport", "Verzekeringen",
  "Abonnementen", "Marketing", "Personeel", "Huisvesting", "Overig",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editBtw, setEditBtw] = useState("");

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push("/login"); return; }

    async function fetchData() {
      try {
        const data = await api.getTransactions(200);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fout bij laden");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  function startEdit(tx: Transaction) {
    setEditingId(tx.id);
    setEditCategory(tx.category || "");
    setEditBtw(tx.btw_rate || "21");
  }

  async function saveEdit(tx: Transaction) {
    try {
      await api.updateTransaction(tx.id, {
        category: editCategory || undefined,
        btw_rate: editBtw || undefined,
      });
      setTransactions(transactions.map((t) =>
        t.id === tx.id ? { ...t, category: editCategory || null, btw_rate: editBtw || null } : t
      ));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan");
    }
  }

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      (tx.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.counterparty || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(search.toLowerCase());

    const matchType =
      filterType === "all" ||
      (filterType === "income" && tx.is_income) ||
      (filterType === "expense" && !tx.is_income);

    return matchSearch && matchType;
  });

  const totalIncome = filtered.filter((t) => t.is_income).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => !t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">Transacties</h1>

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

          {!loading && !error && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Totaal transacties</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{filtered.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Inkomsten</p>
                  <p className="text-2xl font-bold text-[#0D9668]">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Uitgaven</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Zoeken op omschrijving, tegenpartij, categorie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#E0DCD5] bg-white text-sm text-[#1A1A2E] placeholder-[#636E72] focus:outline-none focus:border-[#0D9668]"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
                  className="px-4 py-2 rounded-lg border border-[#E0DCD5] bg-white text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                >
                  <option value="all">Alles</option>
                  <option value="income">Inkomsten</option>
                  <option value="expense">Uitgaven</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                {filtered.length === 0 ? (
                  <p className="text-sm text-[#636E72] py-8 text-center">
                    Geen transacties gevonden.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#636E72] border-b border-[#E0DCD5]">
                        <th className="pb-3">Datum</th>
                        <th className="pb-3">Omschrijving</th>
                        <th className="pb-3">Tegenpartij</th>
                        <th className="pb-3">Categorie</th>
                        <th className="pb-3">BTW</th>
                        <th className="pb-3 text-right">Bedrag</th>
                        <th className="pb-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#E0DCD5] last:border-0">
                          <td className="py-3 text-sm text-[#636E72]">{formatDate(tx.date)}</td>
                          <td className="py-3 text-sm text-[#1A1A2E] font-medium">
                            {tx.description || "—"}
                          </td>
                          <td className="py-3 text-sm text-[#636E72]">{tx.counterparty || "—"}</td>
                          <td className="py-3">
                            {editingId === tx.id ? (
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-[#0D9668] bg-white text-[#1A1A2E] focus:outline-none"
                              >
                                <option value="">Geen</option>
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            ) : tx.category ? (
                              <span
                                onClick={() => startEdit(tx)}
                                className="text-xs bg-[#EDEAE4] text-[#636E72] px-2 py-1 rounded-full cursor-pointer hover:bg-[#E0DCD5]"
                              >
                                {tx.category}
                              </span>
                            ) : (
                              <span
                                onClick={() => startEdit(tx)}
                                className="text-xs text-[#636E72] cursor-pointer hover:text-[#0D9668]"
                              >
                                + categorie
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            {editingId === tx.id ? (
                              <select
                                value={editBtw}
                                onChange={(e) => setEditBtw(e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-[#0D9668] bg-white text-[#1A1A2E] focus:outline-none"
                              >
                                <option value="21">21%</option>
                                <option value="9">9%</option>
                                <option value="0">0%</option>
                              </select>
                            ) : (
                              <span className="text-sm text-[#636E72]">
                                {tx.btw_rate ? `${tx.btw_rate}%` : "—"}
                              </span>
                            )}
                          </td>
                          <td className={`py-3 text-sm text-right font-medium ${
                            tx.is_income ? "text-[#0D9668]" : "text-[#1A1A2E]"
                          }`}>
                            {tx.is_income ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                          </td>
                          <td className="py-3 text-right">
                            {editingId === tx.id ? (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => saveEdit(tx)}
                                  className="text-xs px-2 py-1 bg-[#0D9668] text-white rounded hover:bg-[#0B7D56]"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs px-2 py-1 text-[#636E72] hover:text-[#1A1A2E]"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(tx)}
                                className="text-xs text-[#636E72] hover:text-[#0D9668]"
                              >
                                Bewerk
                              </button>
                            )}
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
