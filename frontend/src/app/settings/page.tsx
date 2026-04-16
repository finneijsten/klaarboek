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

type Profile = {
  id: number;
  email: string;
  company_name: string | null;
  kvk_number: string | null;
  btw_number: string | null;
  created_at: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

function BankRow({
  bank,
  onDelete,
  onError,
}: {
  bank: BankConnection;
  onDelete: () => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const r = await api.importBankCSV(bank.id, file);
      setResult(`${r.imported} transactie(s) geïmporteerd`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Import mislukt");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="border border-[#E0DCD5] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#1A1A2E]">{bank.bank_name}</p>
          <p className="text-sm text-[#636E72] font-mono">{bank.iban}</p>
          <p className="text-xs text-[#636E72] mt-1">Gekoppeld op {formatDate(bank.connected_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              bank.is_active ? "bg-green-100 text-[#0D9668]" : "bg-gray-100 text-[#636E72]"
            }`}
          >
            {bank.is_active ? "Actief" : "Inactief"}
          </span>
          <button onClick={onDelete} className="text-sm text-red-500 hover:text-red-700">
            Verwijderen
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer text-[#0D9668] hover:text-[#0B7D56] font-medium">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? "Importeren..." : "+ CSV importeren"}
        </label>
        <span className="text-[#636E72]">
          Ondersteunt ING, Rabobank, ABN AMRO, Bunq, Knab, Revolut
        </span>
        {result && <span className="text-[#0D9668] font-medium">{result}</span>}
      </div>
    </div>
  );
}

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

  // Profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [btwNumber, setBtwNumber] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push("/login"); return; }
    fetchBanks();
    fetchProfile();
  }, [router]);

  async function fetchProfile() {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setCompanyName(data.company_name || "");
      setKvkNumber(data.kvk_number || "");
      setBtwNumber(data.btw_number || "");
    } catch {
      // Profile fetch failed, non-critical
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const updated = await api.updateProfile({
        company_name: companyName || undefined,
        kvk_number: kvkNumber || undefined,
        btw_number: btwNumber || undefined,
      });
      setProfile(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan profiel");
    } finally {
      setSavingProfile(false);
    }
  }

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
                  <BankRow
                    key={bank.id}
                    bank={bank}
                    onDelete={() => handleDeleteBank(bank.id)}
                    onError={(m) => setError(m)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Bedrijfsgegevens</h2>
            {profile && (
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">E-mail</label>
                    <input
                      type="text"
                      disabled
                      value={profile.email}
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#636E72] bg-[#F5F3EF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">Bedrijfsnaam</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">KVK-nummer</label>
                    <input
                      type="text"
                      value={kvkNumber}
                      onChange={(e) => setKvkNumber(e.target.value)}
                      placeholder="12345678"
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] placeholder-[#636E72] focus:outline-none focus:border-[#0D9668]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-1">BTW-nummer</label>
                    <input
                      type="text"
                      value={btwNumber}
                      onChange={(e) => setBtwNumber(e.target.value)}
                      placeholder="NL000000000B01"
                      className="w-full px-4 py-2 rounded-lg border border-[#E0DCD5] text-sm text-[#1A1A2E] placeholder-[#636E72] focus:outline-none focus:border-[#0D9668]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2 bg-[#0D9668] text-white rounded-lg text-sm font-medium hover:bg-[#0B7D56] disabled:opacity-50"
                  >
                    {savingProfile ? "Opslaan..." : "Opslaan"}
                  </button>
                  {profileSaved && (
                    <span className="text-sm text-[#0D9668] font-medium">Opgeslagen!</span>
                  )}
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
