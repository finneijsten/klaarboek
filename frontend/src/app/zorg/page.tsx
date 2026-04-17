"use client";

import Link from "next/link";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ZorgLanding() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A2E] selection:bg-[#0D9668]/25">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1A1A2E]/10">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-sm font-bold tracking-[0.22em]">
            KLAARBOEK
          </Link>
          <span className="hidden sm:inline text-xs font-mono text-[#B5651D]">
            voor fysiotherapeuten
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hidden sm:inline hover:text-[#0D9668]">
            ← Algemene versie
          </Link>
          <Link href="/login" className="hover:text-[#0D9668]">
            Inloggen
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-b border-[#1A1A2E]/10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-8">
            ✺ Voor zelfstandige fysiotherapeuten
          </p>
          <h1 className="text-[clamp(2.5rem,6.5vw,5rem)] font-bold leading-[0.98] tracking-tight mb-8">
            Declareren is al gedoe.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-[#F5F3EF] px-3">Boekhouden hoeft niet</span>
              <span className="absolute inset-0 bg-[#0D9668] -rotate-1" aria-hidden />
            </span>{" "}
            erbij.
          </h1>
          <p className="text-lg md:text-xl text-[#636E72] max-w-2xl leading-relaxed mb-10">
            KlaarBoek wordt een boekhoudprogramma specifiek voor fysiotherapeuten met
            eigen praktijk: met BTW-vrijstelling voor zorgdiensten, AGB-code op je
            factuur, en overzicht van openstaande declaraties per zorgverzekeraar.
          </p>
          <div className="bg-[#1A1A2E] text-[#F5F3EF] p-6 md:p-8 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-[#B5651D] mb-2">
              Status
            </p>
            <p className="text-lg leading-relaxed">
              We zijn aan het praten met 15 fysio-ZZP&apos;ers om dit goed te bouwen.
              Ben je fysiotherapeut en wil je dat deze versie er komt?{" "}
              <span className="text-[#F5F3EF] font-medium">
                Laat je e-mail achter — je hoort als eerste wanneer het klaar is.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Pain — specific to physiotherapists */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Specifiek voor fysio-ZZP
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-14 max-w-3xl">
            Vier dingen waar Moneybird je niet mee helpt.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "BTW-vrijstelling automatisch toepassen",
                body:
                  "Zorgdiensten zijn vrijgesteld onder art. 11 lid 1 onder g Wet OB. Generieke pakketten zetten toch 21% op je factuur — jij moet elke keer zelf corrigeren. KlaarBoek herkent een behandeling en laat BTW automatisch weg.",
              },
              {
                title: "Maar wél BTW op tape, workshops en sportadvies",
                body:
                  "Niet alles wat je verkoopt is vrijgesteld. Een sportadvies of een rol kinesiotape is wél 21%. KlaarBoek scheidt dat voor je — zorgprestatie vrij, overige diensten belast.",
              },
              {
                title: "AGB-code en BIG-nummer op je factuur",
                body:
                  "Zorgverzekeraars willen dit zien, particuliere klanten soms ook. Bij Moneybird zet je dat elke keer handmatig. Bij KlaarBoek komt het vanzelf op elke factuur.",
              },
              {
                title: "Overzicht van openstaande declaraties per verzekeraar",
                body:
                  "Zilveren Kruis, CZ, VGZ, Menzis — ieder op eigen tempo. Welke declaratie is uitbetaald, welke afgewezen, welke staat nog? Een eigen dashboard in plaats van vier portals openhouden.",
              },
            ].map((c) => (
              <div key={c.title} className="border-t-2 border-[#1A1A2E] pt-6">
                <h3 className="text-xl font-bold mb-3 leading-tight">{c.title}</h3>
                <p className="text-[#636E72] leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Vergelijking
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-14 max-w-3xl">
            Waarom niet Moneybird of e-Boekhouden?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1A1A2E]">
                  <th className="text-left py-4 pr-8 font-mono text-xs uppercase tracking-widest text-[#636E72] w-1/2">
                    Functie
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="font-bold text-base">KlaarBoek</span>
                    <span className="block text-xs font-mono text-[#B5651D]">fysio-versie</span>
                  </th>
                  <th className="py-4 px-4 text-center font-mono text-xs text-[#636E72] uppercase tracking-widest">
                    Moneybird
                  </th>
                  <th className="py-4 px-4 text-center font-mono text-xs text-[#636E72] uppercase tracking-widest">
                    e-Boekhouden
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["BTW-vrijstelling zorgdiensten automatisch", "✓", "✗", "✗"],
                  ["BTW-split: vrij/belast in één kwartaalrapport", "✓", "✗", "✗"],
                  ["AGB-code en BIG-nummer op factuur", "✓", "✗", "✗"],
                  ["Declaratie-overzicht per zorgverzekeraar", "bouwt", "✗", "✗"],
                  ["Kwartaal BTW-rapport", "✓", "✓", "✓"],
                  ["Facturen met PDF-download", "✓", "✓", "✓"],
                  ["Bank-CSV importeren", "✓", "✓", "✓"],
                  ["Prijs per maand", "€9,99", "€19+", "€12+"],
                ].map(([feat, kb, mb, eb]) => (
                  <tr key={feat} className="border-b border-[#1A1A2E]/10">
                    <td className="py-4 pr-8 text-[#1A1A2E] leading-snug">{feat}</td>
                    <td
                      className={`py-4 px-6 text-center font-semibold ${
                        kb === "✓"
                          ? "text-[#0D9668]"
                          : kb === "✗"
                          ? "text-red-400"
                          : "text-[#B5651D]"
                      }`}
                    >
                      {kb}
                    </td>
                    <td
                      className={`py-4 px-4 text-center ${
                        mb === "✓" ? "text-[#636E72]" : "text-[#B2BEC3]"
                      }`}
                    >
                      {mb}
                    </td>
                    <td
                      className={`py-4 px-4 text-center ${
                        eb === "✓" ? "text-[#636E72]" : "text-[#B2BEC3]"
                      }`}
                    >
                      {eb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs font-mono text-[#B2BEC3] mt-6">
            Declaratie-overzicht per verzekeraar is in aanbouw — beschikbaar na validatiefase.
          </p>
        </div>
      </section>

      {/* Honest about phase */}
      <section className="bg-[#1A1A2E] text-[#F5F3EF] px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Eerlijk: waar staan we
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-10">
            De algemene versie werkt al. De fysio-versie is in aanbouw.
          </h2>
          <div className="space-y-8 text-lg text-[#B2BEC3] leading-relaxed">
            <p>
              Het <span className="text-[#F5F3EF]">algemene</span> KlaarBoek (zelfde €9,99/mnd)
              werkt nu: bankafschrift uploaden, categoriseren, BTW-rapport per kwartaal,
              facturen met PDF. Je kan vandaag{" "}
              <Link href="/register" className="underline underline-offset-4 text-[#F5F3EF] hover:text-[#0D9668]">
                een account aanmaken
              </Link>{" "}
              en gebruiken.
            </p>
            <p>
              De <span className="text-[#F5F3EF]">fysio-specifieke dingen</span> hierboven —
              BTW-vrijstelling automatisch, AGB-veld, declaratie-dashboard — komen erbij
              nadat we met genoeg fysiotherapeuten hebben gesproken om het goed te doen.
              Dat duurt 2–3 maanden.
            </p>
            <p className="text-[#F5F3EF] font-medium">
              Laat je e-mail achter als je hier vroeg in wil. Als je liever meewerkt en
              een gesprek van 20 minuten wilt doen: antwoord op de welkomst-mail, we
              nodigen je uit.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Early access
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            Eerste 15 fysio&apos;s krijgen 6 maanden gratis.
          </h2>
          <p className="text-[#636E72] leading-relaxed mb-8">
            In ruil voor feedback en 20 minuten praten. Geen pitch, wel scherpe vragen
            over hoe jouw praktijk nu draait.
          </p>
          <ZorgWaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 text-xs font-mono text-[#636E72] flex flex-wrap justify-between gap-4">
        <span>© 2026 KlaarBoek</span>
        <span>
          Fysio-landing · meer sub-vertikalen later ·{" "}
          <Link href="/" className="underline underline-offset-4">
            terug naar algemene versie
          </Link>
        </span>
      </footer>
    </div>
  );
}

function ZorgWaitlistForm() {
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
      if (!res.ok) throw new Error(data.detail || "Inschrijving mislukt");
      setStatus("success");
      setMessage(data.message || "Aangemeld! We nemen contact op voor een gesprek.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Er ging iets mis. Probeer het later opnieuw.");
    }
  }

  if (status === "success") {
    return (
      <div className="border-2 border-[#0D9668] bg-white p-6">
        <p className="text-sm font-mono uppercase tracking-widest text-[#0D9668] mb-2">
          ✓ Aangemeld
        </p>
        <p className="text-[#1A1A2E] leading-relaxed">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="zorg-email" className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-2 block">
          E-mail
        </label>
        <input
          id="zorg-email"
          type="email"
          required
          placeholder="jouw@praktijk.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="w-full px-4 py-3 border border-[#1A1A2E]/20 bg-white focus:outline-none focus:border-[#0D9668] text-lg"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 bg-[#0D9668] text-white font-medium hover:bg-[#0A7B55] disabled:opacity-50"
      >
        {status === "loading" ? "Aanmelden..." : "Aanmelden voor early access"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      <p className="text-xs font-mono text-[#B2BEC3]">
        Geen spam, geen nieuwsbrief. Alleen een mail als er nieuws is.
      </p>
    </form>
  );
}
