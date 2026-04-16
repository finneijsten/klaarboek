"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A2E] flex flex-col">
      <nav className="px-6 md:px-12 py-5 border-b border-[#1A1A2E]/10">
        <Link href="/" className="text-sm font-bold tracking-[0.22em]">
          KLAARBOEK
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-4">
            Account aanmaken
          </p>
          <h1 className="text-4xl font-bold mb-10">Laten we beginnen.</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                E-mail *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white focus:outline-none focus:border-[#0D9668]"
                placeholder="jouw@email.nl"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                Wachtwoord *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white focus:outline-none focus:border-[#0D9668]"
                placeholder="Minimaal 8 tekens"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                Bedrijfsnaam
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white focus:outline-none focus:border-[#0D9668]"
                placeholder="Jouw bedrijf B.V."
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                KVK-nummer
              </label>
              <input
                type="text"
                value={form.kvkNumber}
                onChange={(e) => update("kvkNumber", e.target.value)}
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white focus:outline-none focus:border-[#0D9668]"
                placeholder="12345678"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D9668] text-white py-3 font-medium hover:bg-[#0A7B55] disabled:opacity-50 mt-2"
            >
              {loading ? "Bezig..." : "Account aanmaken"}
            </button>
          </form>

          <p className="text-sm text-[#636E72] mt-8">
            Al een account?{" "}
            <Link href="/login" className="text-[#0D9668] underline underline-offset-4">
              Inloggen
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
