import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A2E] selection:bg-[#0D9668]/20">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1A1A2E]/10">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-[0.22em] text-[#1A1A2E]">KLAARBOEK</span>
          <span className="hidden sm:inline text-xs font-mono text-[#636E72]">
            boekhouding voor zzp
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-[#1A1A2E] hover:text-[#0D9668]">
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

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 md:pt-28 pb-16 md:pb-24 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-8">
            Nederlandse ZZP · sinds 2026
          </p>
          <h1 className="text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.95] tracking-tight mb-10">
            Boekhouding,
            <br />
            <span className="text-[#0D9668]">zonder poeha.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#636E72] max-w-2xl leading-relaxed mb-10">
            Upload je bankafschrift. KlaarBoek sorteert het in de juiste
            categorieën en BTW-tarieven, en zet je kwartaalrapport klaar.
            Geen pakketten, geen upsells. €9,99 per maand.
          </p>
          <div className="flex flex-wrap items-center gap-6">
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
              Of probeer de demo →
            </Link>
          </div>
          <p className="mt-6 text-xs font-mono text-[#B2BEC3]">
            Gratis tijdens de beta · geen creditcard nodig
          </p>
        </div>
      </section>

      {/* How it works — numbered list */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-12">
          Hoe het werkt
        </p>
        <ol className="max-w-5xl divide-y divide-[#1A1A2E]/10 border-t border-[#1A1A2E]/10">
          {[
            {
              n: "01",
              title: "Importeer je bankafschrift",
              body:
                "CSV van ING, Rabobank, ABN AMRO, Bunq, Knab of Revolut. Hele maand in één keer, of een heel jaar — het maakt niet uit. Geen tussenpartij die in je rekening kijkt.",
            },
            {
              n: "02",
              title: "KlaarBoek sorteert",
              body:
                "Transacties krijgen automatisch een categorie en BTW-tarief volgens transparante regels die je zelf kan inzien. Klopt iets niet? Eén klik en het is aangepast. Je correcties blijven staan.",
            },
            {
              n: "03",
              title: "Rapport per kwartaal, filing doe je zelf",
              body:
                "Aan het einde van het kwartaal zie je precies wat je moet betalen of terugkrijgt. Inloggen op belastingdienst.nl doe je zelf. Wij leveren de cijfers — jij houdt de regie.",
            },
          ].map((step) => (
            <li key={step.n} className="grid grid-cols-[auto_1fr] gap-8 md:gap-16 py-10">
              <span className="text-2xl md:text-3xl font-mono text-[#B5651D]">{step.n}</span>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h3>
                <p className="text-[#636E72] max-w-2xl leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Comparison */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
          Eerlijk vergelijken
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-10 max-w-2xl">
          We doen niet alles. Dat is het punt.
        </h2>
        <div className="max-w-4xl overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b-2 border-[#1A1A2E] text-left">
                <th className="py-3 pr-6 font-mono font-normal text-xs uppercase tracking-wider text-[#636E72]"></th>
                <th className="py-3 px-4 font-bold text-[#0D9668]">KlaarBoek</th>
                <th className="py-3 px-4 font-bold text-[#636E72]">Moneybird</th>
                <th className="py-3 px-4 font-bold text-[#636E72]">Boekhouder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A2E]/10">
              {[
                ["Prijs per maand", "€9,99", "€14–33", "€40–150"],
                ["Bank-import", "CSV upload", "PSD2 sync", "— (jij stuurt)"],
                ["Auto-categorisatie", "ja, transparante regels", "ja, 80–90%", "ze doen het"],
                ["BTW-rapport", "per kwartaal", "export", "ze doen het"],
                ["BTW-filing doen wij?", "nee, jij houdt regie", "nee", "ja"],
                ["Setup-tijd", "< 5 minuten", "medium", "afspraak inplannen"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="py-4 pr-6 font-mono text-[#636E72]">{row[0]}</td>
                  <td className="py-4 px-4 font-medium">{row[1]}</td>
                  <td className="py-4 px-4 text-[#636E72]">{row[2]}</td>
                  <td className="py-4 px-4 text-[#636E72]">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-b border-[#1A1A2E]/10">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Begin met je eerste kwartaal.
          </h2>
          <p className="text-[#636E72] text-lg mb-8 leading-relaxed">
            Gratis tijdens de beta. Geen contract. Je data is van jou, en kan je
            altijd exporteren als ZIP.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-[#0D9668] text-white font-medium hover:bg-[#0A7B55]"
          >
            Account aanmaken
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 text-xs font-mono text-[#636E72] flex flex-wrap justify-between gap-4">
        <span>© 2026 KlaarBoek</span>
        <span>Nederlands ontworpen · gemaakt voor ZZP</span>
      </footer>
    </div>
  );
}
