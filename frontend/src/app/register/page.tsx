"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", companyName: "", kvkNumber: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register(form.email, form.password, form.companyName || undefined, form.kvkNumber || undefined);
      await api.login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registratie mislukt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E0DCD5] p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#0D9668] tracking-wider mb-2">KLAARBOEK</h1>
        <p className="text-sm text-[#636E72] mb-8">Maak je account aan</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="jouw@email.nl"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Wachtwoord *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="Minimaal 8 tekens"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Bedrijfsnaam</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="Jouw bedrijf B.V."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">KVK-nummer</label>
            <input
              type="text"
              value={form.kvkNumber}
              onChange={(e) => update("kvkNumber", e.target.value)}
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="12345678"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D9668] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#0a7d56] disabled:opacity-50"
          >
            {loading ? "Bezig..." : "Account aanmaken"}
          </button>
        </form>

        <p className="text-sm text-[#636E72] mt-6 text-center">
          Al een account?{" "}
          <a href="/login" className="text-[#0D9668] font-medium hover:underline">
            Inloggen
          </a>
        </p>
      </div>
    </div>
  );
}
