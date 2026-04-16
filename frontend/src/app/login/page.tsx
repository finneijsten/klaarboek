"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Ongeldige inloggegevens");
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
            Inloggen
          </p>
          <h1 className="text-4xl font-bold mb-10">Welkom terug.</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                placeholder="jouw@email.nl"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D9668] text-white py-3 font-medium hover:bg-[#0A7B55] disabled:opacity-50"
            >
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>

          <p className="text-sm text-[#636E72] mt-8">
            Nog geen account?{" "}
            <Link href="/register" className="text-[#0D9668] underline underline-offset-4">
              Registreer
            </Link>
          </p>

          <div className="mt-8 p-4 border border-dashed border-[#1A1A2E]/20 text-xs font-mono text-[#636E72]">
            demo-account · demo@klaarboek.nl · demo
          </div>
        </div>
      </main>
    </div>
  );
}
