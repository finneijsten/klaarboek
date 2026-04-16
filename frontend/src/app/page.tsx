import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A2E] selection:bg-[#0D9668]/25">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1A1A2E]/10">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-[0.22em]">KLAARBOEK</span>
          <span className="hidden sm:inline text-xs font-mono text-[#636E72]">
            est. 2026 · nederland
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/login" className="hover:text-[#0D9668]">
            Inloggen
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#1A1A2E] text-[#F5F3EF] hover:bg-[#0D9668]"
          >
            Account aanmaken
          </Link>
        </div>
      </nav>

      {/* Hero — split layout, receipt on right as a visual anchor */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-b border-[#1A1A2E]/10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-8">
              ✺ Boekhouding · ZZP · sinds 2026
            </p>
            <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
              De boekhouder
              <br />
              die niet zegt
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[#F5F3EF] px-3">&ldquo;ik bel je terug&rdquo;</span>
                <span className="absolute inset-0 bg-[#0D9668] -rotate-1" aria-hidden />
              </span>
              .
            </h1>
            <p className="text-lg text-[#636E72] max-w-xl leading-relaxed mb-10">
              Upload je bankafschrift, KlaarBoek sorteert het, en je
              kwartaalrapport staat klaar. Geen pakketten, geen upsells.
              €9,99 per maand.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="px-6 py-3 bg-[#0D9668] text-white font-medium hover:bg-[#0A7B55]"
              >
                Account aanmaken
              </Link>
              <Link
                href="/login"
                className="text-[#1A1A2E] underline underline-offset-4 hover:text-[#0D9668]"
              >
                Demo bekijken →
              </Link>
            </div>
            <p className="mt-5 text-xs font-mono text-[#B2BEC3]">
              gratis tijdens de beta · geen creditcard · exporteer je data als ZIP
            </p>
          </div>

          {/* Fake receipt — the visual weight on the right */}
          <Receipt />
        </div>
      </section>

      {/* Dark band — 'wat het níét is' */}
      <section className="bg-[#1A1A2E] text-[#F5F3EF] px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Waarom anders
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-14">
            Wat KlaarBoek <span className="italic font-serif text-[#0D9668]">niet</span> is.
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-6 text-left">
            {[
              {
                title: "Geen AI-praatjes",
                body:
                  "Regel-gebaseerde categorisatie die je kan inzien én aanpassen. Geen zwarte doos, geen 'vertrouw ons maar'. Jij ziet waarom een transactie in een categorie valt.",
              },
              {
                title: "Geen jaarcontract",
                body:
                  "Maandelijks opzegbaar. Exporteer je data als ZIP als je weggaat. Je gegevens zijn van jou, altijd.",
              },
              {
                title: "Geen boekhouder-uurtarief",
                body:
                  "€9,99 per maand voor alles. Geen 'we sturen je de factuur', geen wachten op een belafspraak. Zelf doen, wel goed.",
              },
            ].map((c) => (
              <div key={c.title} className="border-t border-[#F5F3EF]/20 pt-6">
                <h3 className="text-xl font-bold mb-3">{c.title}</h3>
                <p className="text-[#B2BEC3] leading-relaxed text-sm">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process — horizontal */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6 text-center">
            In drie stappen
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-14 text-center">
            Van bankafschrift naar BTW-rapport.
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                n: "01",
                title: "Importeer",
                body:
                  "CSV van ING, Rabobank, ABN AMRO, Bunq, Knab of Revolut. Hele maand, of een heel jaar — net wat jij wilt.",
              },
              {
                n: "02",
                title: "Sorteer",
                body:
                  "Categorieën en BTW-tarieven worden automatisch toegekend. Klopt iets niet? Eén klik en het is aangepast.",
              },
              {
                n: "03",
                title: "Rapport",
                body:
                  "Aan het einde van het kwartaal zie je precies wat je moet betalen of terugkrijgt. Filing doe je zelf.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t-2 border-[#1A1A2E] pt-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-sm font-mono text-[#B5651D]">{step.n}</span>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-[#636E72] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10 bg-[#EDE9E3]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-4">
            Eerlijk vergelijken
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-10 max-w-2xl">
            We doen niet alles. Dat is het punt.
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base bg-white">
              <thead>
                <tr className="border-b-2 border-[#1A1A2E] text-left">
                  <th className="py-4 px-5 font-mono font-normal text-xs uppercase tracking-wider text-[#636E72]" />
                  <th className="py-4 px-5 font-bold text-[#0D9668]">KlaarBoek</th>
                  <th className="py-4 px-5 font-bold text-[#636E72]">Moneybird</th>
                  <th className="py-4 px-5 font-bold text-[#636E72]">Boekhouder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A2E]/10">
                {[
                  ["Prijs per maand", "€9,99", "€14–33", "€40–150"],
                  ["Bank-import", "CSV upload", "PSD2 sync", "— (jij stuurt)"],
                  ["Auto-categorisatie", "transparante regels", "80–90%", "zij doen het"],
                  ["BTW-rapport", "per kwartaal", "export", "zij doen het"],
                  ["BTW-filing?", "nee, jij houdt regie", "nee", "ja"],
                  ["Setup", "< 5 minuten", "medium", "afspraak inplannen"],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="py-4 px-5 font-mono text-[#636E72]">{row[0]}</td>
                    <td className="py-4 px-5 font-medium">{row[1]}</td>
                    <td className="py-4 px-5 text-[#636E72]">{row[2]}</td>
                    <td className="py-4 px-5 text-[#636E72]">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing CTA — centered */}
      <section className="px-6 md:px-12 py-24 md:py-32 border-b border-[#1A1A2E]/10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Tot zo ver de uitleg
          </p>
          <h2 className="text-4xl md:text-6xl font-bold leading-[1.05] mb-8">
            Begin met je eerste kwartaal.
          </h2>
          <p className="text-[#636E72] text-lg mb-10 leading-relaxed">
            Gratis tijdens de beta. Geen contract. Exporteer altijd.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-[#0D9668] text-white font-medium hover:bg-[#0A7B55] text-lg"
          >
            Account aanmaken →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 text-xs font-mono text-[#636E72] flex flex-wrap justify-between gap-4">
        <span>© 2026 KlaarBoek</span>
        <span>Gemaakt voor nederlandse zzp · met irritant veel aandacht voor detail</span>
      </footer>
    </div>
  );
}

function Receipt() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className="bg-white p-8 shadow-[0_20px_60px_-20px_rgba(26,26,46,0.25)] rotate-[-1.2deg] font-mono text-xs leading-relaxed text-[#1A1A2E]"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 10px), 95% 100%, 85% calc(100% - 10px), 75% 100%, 65% calc(100% - 10px), 55% 100%, 45% calc(100% - 10px), 35% 100%, 25% calc(100% - 10px), 15% 100%, 5% calc(100% - 10px), 0 100%)",
        }}
      >
        <div className="text-center mb-4">
          <div className="font-bold tracking-[0.2em] text-sm">KLAARBOEK</div>
          <div className="text-[10px] text-[#636E72]">
            factuur · 2026-001
          </div>
        </div>
        <div className="border-t border-dashed border-[#1A1A2E]/30 my-3" />
        <div className="grid grid-cols-[1fr_auto] gap-y-1">
          <span className="text-[#636E72]">klant</span>
          <span className="text-right">Bakkerij van Dam</span>
          <span className="text-[#636E72]">kvk</span>
          <span className="text-right">12345678</span>
          <span className="text-[#636E72]">datum</span>
          <span className="text-right">10 apr 2026</span>
        </div>
        <div className="border-t border-dashed border-[#1A1A2E]/30 my-3" />
        <div className="grid grid-cols-[1fr_auto] gap-y-1">
          <span>Website redesign</span>
          <span className="text-right">€ 1.983,47</span>
          <span className="text-[#636E72] pl-4">BTW 21%</span>
          <span className="text-right text-[#636E72]">€ 416,53</span>
        </div>
        <div className="border-t border-[#1A1A2E] my-3" />
        <div className="grid grid-cols-[1fr_auto]">
          <span className="font-bold">totaal</span>
          <span className="text-right font-bold text-sm">€ 2.400,00</span>
        </div>
        <div className="mt-5 pt-3 border-t border-dashed border-[#1A1A2E]/30">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#636E72]">status</span>
            <span className="text-[#0D9668] font-bold">✓ BETAALD · via ING</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-[#636E72]">categorie</span>
            <span>Omzet · 21%</span>
          </div>
        </div>
        <div className="text-center mt-5 text-[10px] text-[#636E72]">
          bedankt voor je vertrouwen.
        </div>
      </div>

      {/* Subtle stamp */}
      <div className="absolute -right-2 -top-2 md:-right-6 md:-top-6 border-2 border-[#B5651D] text-[#B5651D] px-3 py-2 rotate-[8deg] font-mono text-[10px] tracking-widest uppercase bg-[#F5F3EF]">
        Nederlands
        <br />
        ontworpen
      </div>
    </div>
  );
}
