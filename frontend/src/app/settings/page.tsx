"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type BankConnection = {
  id: number;
  bank_name: string;
  iban: string;
  is_active: boolean;
  connected_at: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);

  // Bank form
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push("/login"); return; }
    fetchBanks();
  }, [router]);

  async function fetchBanks() {
    try {
      const data = await api.getBankConnections();
      setBanks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij laden");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createBankConnection({ bank_name: bankName, iban: iban.toUpperCase().replace(/\s/g, "") });
      setBankName("");
      setIban("");
      setShowBankForm(false);
      setLoading(true);
      await fetchBanks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij toevoegen");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBank(id: number) {
    try {
      await api.deleteBankConnection(id);
      setBanks(banks.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij verwijderen");
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">Instellingen</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Bank connections */}
          <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">Bankrekeningen</h2>
                <p className="text-sm text-[#636E72] mt-1">Beheer je gekoppelde bankrekeningen</p>
              </div>
              <button
                onClick={() => setShowBankForm(!showBankForm)}
                className="px-4 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56]"
              >
                {showBankForm ? "Annuleren" : "+ Bankrekening toevoegen"}
              </button>
            </div>

            {showBankForm && (
              <form onSubmit={handleAddBank} className="border border-[#E0DCD5] rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">Bank</label>
                    <input
                      type="text"
                      required
                      placeholder="bijv. ING, Rabobank, ABN AMRO"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] placeholder-[#636E72] focus:outline-none focus:border-[#0D9668]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">IBAN</label>
                    <input
                      type="text"
                      required
                      placeholder="NL00 BANK 0000 0000 00"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] placeholder-[#636E72] focus:outline-none focus:border-[#0D9668]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 px-6 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56] disabled:opacity-50"
                >
                  {submitting ? "Toevoegen..." : "Toevoegen"}
                </button>
              </form>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0D9668]"></div>
              </div>
            ) : banks.length === 0 ? (
              <p className="text-sm text-[#636E72] py-8 text-center">
                Nog geen bankrekeningen gekoppeld.
              </p>
            ) : (
              <div className="space-y-3">
                {banks.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between border border-[#E0DCD5] rounded-xl p-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{bank.bank_name}</p>
                      <p className="text-sm text-[#636E72] font-mono">{bank.iban}</p>
                      <p className="text-xs text-[#636E72] mt-1">Gekoppeld op {formatDate(bank.connected_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        bank.is_active ? "bg-green-100 text-[#0D9668]" : "bg-gray-100 text-[#636E72]"
                      }`}>
                        {bank.is_active ? "Actief" : "Inactief"}
                      </span>
                      <button
                        onClick={() => handleDeleteBank(bank.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Account</h2>
            <p className="text-sm text-[#636E72]">
              Profielinstellingen en bedrijfsgegevens worden binnenkort beschikbaar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
