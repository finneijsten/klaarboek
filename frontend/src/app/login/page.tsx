"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E0DCD5] p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#0D9668] tracking-wider mb-2">KLAARBOEK</h1>
        <p className="text-sm text-[#636E72] mb-8">Log in op je account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="jouw@email.nl"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A2E] mb-1 block">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#E0DCD5] rounded-lg text-sm text-[#1A1A2E] focus:outline-none focus:border-[#0D9668]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D9668] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#0a7d56] disabled:opacity-50"
          >
            {loading ? "Bezig..." : "Inloggen"}
          </button>
        </form>

        <p className="text-sm text-[#636E72] mt-6 text-center">
          Nog geen account?{" "}
          <a href="/register" className="text-[#0D9668] font-medium hover:underline">
            Registreer
          </a>
        </p>

        <div className="mt-4 p-3 bg-[#F5F3EF] rounded-lg border border-[#E0DCD5]">
          <p className="text-xs text-[#636E72] text-center">
            <span className="font-medium text-[#1A1A2E]">Demo account:</span>{" "}
            demo@klaarboek.nl / demo
          </p>
        </div>
      </div>
    </div>
  );
}
