"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Invoice = {
  id: number;
  invoice_number: string | null;
  client_name: string;
  amount_excl_btw: number;
  btw_rate: number;
  btw_amount: number;
  amount_incl_btw: number;
  due_date: string | null;
  is_paid: boolean;
  created_at: string;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [amountExcl, setAmountExcl] = useState("");
  const [btwRate, setBtwRate] = useState("21");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push("/login"); return; }
    fetchInvoices();
  }, [router]);

  async function fetchInvoices() {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createInvoice({
        client_name: clientName,
        amount_excl_btw: parseFloat(amountExcl),
        btw_rate: parseFloat(btwRate),
        due_date: dueDate || undefined,
      });
      setClientName("");
      setAmountExcl("");
      setBtwRate("21");
      setDueDate("");
      setShowForm(false);
      setLoading(true);
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij aanmaken");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePaid(invoice: Invoice) {
    try {
      await api.updateInvoice(invoice.id, { is_paid: !invoice.is_paid });
      setInvoices(invoices.map((inv) =>
        inv.id === invoice.id ? { ...inv, is_paid: !inv.is_paid } : inv
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij bijwerken");
    }
  }

  const totalOpen = invoices.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount_incl_btw, 0);
  const totalPaid = invoices.filter((i) => i.is_paid).reduce((s, i) => s + i.amount_incl_btw, 0);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Facturen</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56]"
            >
              {showForm ? "Annuleren" : "+ Nieuwe factuur"}
            </button>
          </div>

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
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Totaal facturen</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{invoices.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Openstaand</p>
                  <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalOpen)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                  <p className="text-sm text-[#636E72] mb-1">Betaald</p>
                  <p className="text-2xl font-bold text-[#0D9668]">{formatCurrency(totalPaid)}</p>
                </div>
              </div>

              {/* Create form */}
              {showForm && (
                <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-[#E0DCD5] p-6 mb-8">
                  <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Nieuwe factuur</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#636E72] mb-1">Klant</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#636E72] mb-1">Bedrag excl. BTW</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={amountExcl}
                        onChange={(e) => setAmountExcl(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#636E72] mb-1">BTW-tarief</label>
                      <select
                        value={btwRate}
                        onChange={(e) => setBtwRate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                      >
                        <option value="21">21%</option>
                        <option value="9">9%</option>
                        <option value="0">0%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#636E72] mb-1">Vervaldatum</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 px-6 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56] disabled:opacity-50"
                  >
                    {submitting ? "Aanmaken..." : "Factuur aanmaken"}
                  </button>
                </form>
              )}

              {/* Invoice table */}
              <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                {invoices.length === 0 ? (
                  <p className="text-sm text-[#636E72] py-8 text-center">
                    Nog geen facturen. Maak je eerste factuur aan.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#636E72] border-b border-[#E0DCD5]">
                        <th className="pb-3">Nummer</th>
                        <th className="pb-3">Klant</th>
                        <th className="pb-3">Datum</th>
                        <th className="pb-3">Vervaldatum</th>
                        <th className="pb-3 text-right">Excl. BTW</th>
                        <th className="pb-3 text-right">Incl. BTW</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#E0DCD5] last:border-0">
                          <td className="py-3 text-sm font-medium text-[#1A1A2E]">
                            {inv.invoice_number || "—"}
                          </td>
                          <td className="py-3 text-sm text-[#1A1A2E]">{inv.client_name}</td>
                          <td className="py-3 text-sm text-[#636E72]">{formatDate(inv.created_at)}</td>
                          <td className="py-3 text-sm text-[#636E72]">
                            {inv.due_date ? formatDate(inv.due_date) : "—"}
                          </td>
                          <td className="py-3 text-sm text-right text-[#1A1A2E]">
                            {formatCurrency(inv.amount_excl_btw)}
                          </td>
                          <td className="py-3 text-sm text-right font-medium text-[#1A1A2E]">
                            {formatCurrency(inv.amount_incl_btw)}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => togglePaid(inv)}
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                inv.is_paid
                                  ? "bg-green-100 text-[#0D9668]"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {inv.is_paid ? "Betaald" : "Open"}
                            </button>
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
