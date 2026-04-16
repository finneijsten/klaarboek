"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Inschrijving mislukt");
      }
      setStatus("success");
      setMessage(data.message || "Aangemeld!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Er ging iets mis. Probeer het later opnieuw.");
    }
  }

  return (
    <div>
      {status === "success" ? (
        <div className="bg-[#0D9668] text-white px-6 py-3 rounded-xl font-bold">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap justify-center">
          <input
            type="email"
            required
            placeholder="je@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-6 py-3 border-2 border-[#D5D0C8] rounded-xl bg-white text-[#2D3436] w-80 outline-none focus:border-[#0D9668]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-[#0D9668] text-white font-bold rounded-xl hover:bg-[#0A7B55] transition-all disabled:opacity-50"
          >
            {status === "loading" ? "Even wachten..." : "Schrijf je in"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-red-500 text-sm mt-2">{message}</p>
      )}
    </div>
  );
}
