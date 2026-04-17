import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A2E] selection:bg-[#0D9668]/25">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1A1A2E]/10">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-sm font-bold tracking-[0.22em]">
            KLAARBOEK
          </Link>
          <span className="hidden sm:inline text-xs font-mono text-[#636E72]">
            est. 2026 · nederland
          </span>
        </div>
        <div className="flex items-center gap-5 md:gap-8 text-sm">
          <Link
            href="/zorg"
            className="hidden sm:inline text-[#B5651D] underline underline-offset-4 decoration-dotted hover:text-[#0D9668]"
          >
            Werk je in de zorg?
          </Link>
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

      {/* Hero — concrete pain framing */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-b border-[#1A1A2E]/10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-8">
              ✺ Voor Nederlandse ZZP&apos;ers
            </p>
            <h1 className="text-[clamp(2.5rem,6.5vw,5rem)] font-bold leading-[0.98] tracking-tight mb-8">
              Je BTW-aangifte
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[#F5F3EF] px-3">zonder de paniek</span>
                <span className="absolute inset-0 bg-[#0D9668] -rotate-1" aria-hidden />
              </span>
              <br />
              van kwartaal-week.
            </h1>
            <p className="text-lg text-[#636E72] max-w-xl leading-relaxed mb-10">
              KlaarBoek is boekhoud-software voor ZZP&apos;ers die geen boekhouder willen maar
              ook geen uur per week kwijt willen zijn aan Excel. Upload je bankafschrift,
              alles wordt gecategoriseerd, en je kwartaalrapport staat klaar.{" "}
              <span className="text-[#1A1A2E] font-medium">€9,99 per maand.</span>
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="px-6 py-3 bg-[#0D9668] text-white font-medium hover:bg-[#0A7B55]"
              >
                Probeer gratis
              </Link>
              <Link
                href="/login"
                className="text-[#1A1A2E] underline underline-offset-4 hover:text-[#0D9668]"
              >
                Demo bekijken →
              </Link>
            </div>
            <p className="mt-5 text-xs font-mono text-[#B2BEC3]">
              gratis tijdens de beta · geen creditcard · data altijd exporteerbaar
            </p>
          </div>

          <Receipt />
        </div>
      </section>

      {/* Pain — what people are doing now */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Nu
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-14 max-w-3xl">
            Drie manieren waarop je het nu waarschijnlijk doet.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tag: "Optie A · Excel",
                title: "Je doet het zelf in een spreadsheet.",
                body:
                  "Elke maand bonnetjes verzamelen. De week voor de BTW-deadline nog uitzoeken of die lunch nou zakelijk was. Hopen dat je geen transactie bent vergeten.",
                cost: "~2 uur per maand · gratis",
              },
              {
                tag: "Optie B · Boekhouder",
                title: "Je betaalt iemand om het te doen.",
                body:
                  "€60-150 per uur. Je stuurt bonnetjes en afschriften, de boekhouder doet de rest — maar je hebt zelf geen inzicht en de rekening komt pas achteraf.",
                cost: "€600-2.000 per jaar",
              },
              {
                tag: "Optie C · Moneybird",
                title: "Je gebruikt een pakket van €20+ per maand.",
                body:
                  "Automatische bank-sync, maar 80-90% van transacties blijft handmatig corrigeren. Vaak meer features dan je nodig hebt als ZZP&apos;er met 20 transacties per maand.",
                cost: "€170-400 per jaar",
              },
            ].map((c) => (
              <div key={c.tag} className="bg-white border border-[#1A1A2E]/10 p-6">
                <p className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-4">
                  {c.tag}
                </p>
                <h3 className="text-xl font-bold mb-3 leading-tight">{c.title}</h3>
                <p className="text-[#636E72] text-sm leading-relaxed mb-4">{c.body}</p>
                <p className="text-xs font-mono text-[#B5651D]">{c.cost}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-[#1A1A2E] font-medium">
            KlaarBoek zit ertussenin: je doet het zelf, maar het saaie werk is weg.
            <span className="text-[#636E72] font-normal">
              {" "}€9,99 per maand. 5 minuten per kwartaal.
            </span>
          </p>
        </div>
      </section>

      {/* What KlaarBoek actually does */}
      <section className="bg-[#1A1A2E] text-[#F5F3EF] px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6 text-center">
            Wat KlaarBoek doet
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-14 text-center max-w-3xl mx-auto">
            Bankafschrift erin, kwartaalrapport eruit.
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                n: "01",
                title: "Je uploadt je bankafschrift",
                body:
                  "CSV-export van ING, Rabobank, ABN AMRO, Bunq, Knab of Revolut. De hele maand in één keer. Geen tussenpartij die in je rekening kan kijken.",
              },
              {
                n: "02",
                title: "KlaarBoek categoriseert",
                body:
                  "Elke transactie krijgt een categorie, BTW-tarief en zakelijk/privé-vlag. Regel-gebaseerd en inzichtelijk — je ziet waarom, je kan het overschrijven.",
              },
              {
                n: "03",
                title: "Kwartaal-BTW-rapport klaar",
                body:
                  "Aan het einde van het kwartaal druk je op 'bereken'. Je ziet het bedrag dat je moet betalen of terugkrijgt, plus het overzicht dat je nodig hebt voor belastingdienst.nl.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t-2 border-[#F5F3EF]/30 pt-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-sm font-mono text-[#B5651D]">{step.n}</span>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-[#B2BEC3] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[#B2BEC3] mt-14 text-sm">
            + facturen aanmaken, BTW erop,{" "}
            <span className="text-[#F5F3EF]">PDF-download</span>. Inkomsten en uitgaven in
            een duidelijk dashboard. Data altijd exporteerbaar als ZIP.
          </p>
        </div>
      </section>

      {/* Who it's for / not for */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="border border-[#0D9668] bg-white p-8">
            <p className="text-xs font-mono uppercase tracking-wider text-[#0D9668] mb-4">
              ✓ Voor jou
            </p>
            <h3 className="text-2xl font-bold mb-4">Als je ZZP&apos;er bent met…</h3>
            <ul className="space-y-2 text-[#636E72]">
              <li>· eenmanszaak of BV, geen personeel</li>
              <li>· minder dan ~100 transacties per maand</li>
              <li>· 1 of 2 bankrekeningen</li>
              <li>· gewone BTW-situatie (21% / 9% / 0% / vrijgesteld)</li>
              <li>· geen behoefte aan een boekhouder die belt</li>
            </ul>
          </div>
          <div className="border border-[#1A1A2E]/20 bg-[#EDE9E3] p-8">
            <p className="text-xs font-mono uppercase tracking-wider text-[#636E72] mb-4">
              ✕ Niet voor jou
            </p>
            <h3 className="text-2xl font-bold mb-4">KlaarBoek is niet geschikt als je…</h3>
            <ul className="space-y-2 text-[#636E72]">
              <li>· personeel in dienst hebt (salarisadministratie)</li>
              <li>· met meerdere BV&apos;s werkt (geconsolideerd)</li>
              <li>· buitenlandse BTW (ICP/OSS) doet</li>
              <li>· iemand anders de aangifte voor je wil laten doen</li>
              <li>· voorraadadministratie nodig hebt</li>
            </ul>
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
                  ["BTW-filing doen wij?", "nee, jij houdt regie", "nee", "ja"],
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

      {/* FAQ */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1A1A2E]/10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#B5651D] mb-6">
            Veelgestelde vragen
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-10">
            Dingen die mensen ons sturen.
          </h2>
          <dl className="divide-y divide-[#1A1A2E]/10 border-t border-b border-[#1A1A2E]/10">
            {[
              {
                q: "Dient KlaarBoek mijn BTW-aangifte voor me in bij de Belastingdienst?",
                a: "Nee. Wij leveren het rapport met alle cijfers; jij logt in op belastingdienst.nl en vult de velden over. Dat duurt ongeveer 5 minuten. Directe filing via SBR/Digipoort staat op de roadmap maar is niet klaar.",
              },
              {
                q: "Kan ik mijn bank koppelen zoals bij Moneybird?",
                a: "Op dit moment werken we met CSV-upload. Die CSV haal je zo uit je internetbankieren. Dat voelt ouderwets maar heeft voordelen: geen tussenpartij, geen toestemmingen die elke 90 dagen verlopen, en je kiest zelf welke maand je uploadt. PSD2 bank-sync komt later.",
              },
              {
                q: "Wat als KlaarBoek een transactie fout categoriseert?",
                a: "Eén klik om aan te passen. Je correctie blijft staan, en in de toekomst leren de regels zelf van jouw patronen. De categorisatie is transparant — je kan de regels zien, niet 'de AI denkt'.",
              },
              {
                q: "Ik heb al een boekhouder. Waarom zou ik overstappen?",
                a: "Misschien moet je dat niet. KlaarBoek is voor mensen die hun administratie simpel genoeg vinden om zelf te doen, maar geen zin hebben in het handwerk. Heb je personeel of complexe BTW? Blijf bij de boekhouder.",
              },
              {
                q: "Is mijn data veilig?",
                a: "Data staat bij Supabase (EU-servers), wachtwoorden zijn bcrypt-gehashed, toegang verloopt via JWT. Je kan je data altijd als ZIP exporteren, en je account definitief verwijderen (dan is alles weg).",
              },
              {
                q: "Wat kost het echt?",
                a: "€9,99 per maand, maandelijks opzegbaar. Tijdens de beta gratis. Geen setup-fee, geen verborgen kosten, geen 'plus-pakket'.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium pr-4">{item.q}</span>
                  <span className="text-[#B5651D] font-mono text-lg group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-[#636E72] leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing CTA */}
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
          <p className="mt-8 text-sm text-[#636E72]">
            Ben je fysiotherapeut? We maken een versie specifiek voor jou —{" "}
            <Link href="/zorg" className="text-[#B5651D] underline underline-offset-4">
              bekijk /zorg
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 text-xs font-mono text-[#636E72] flex flex-wrap justify-between gap-4">
        <span>© 2026 KlaarBoek</span>
        <span>Gemaakt voor Nederlandse zzp · met irritant veel aandacht voor detail</span>
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
          <div className="text-[10px] text-[#636E72]">kwartaalrapport · Q1 2026</div>
        </div>
        <div className="border-t border-dashed border-[#1A1A2E]/30 my-3" />
        <div className="grid grid-cols-[1fr_auto] gap-y-1">
          <span className="text-[#636E72]">inkomsten</span>
          <span className="text-right">€ 14.000,00</span>
          <span className="text-[#636E72]">uitgaven</span>
          <span className="text-right">€ 650,49</span>
          <span className="text-[#636E72]">winst</span>
          <span className="text-right">€ 13.349,51</span>
        </div>
        <div className="border-t border-dashed border-[#1A1A2E]/30 my-3" />
        <div className="grid grid-cols-[1fr_auto] gap-y-1">
          <span>BTW ontvangen</span>
          <span className="text-right">€ 2.430,57</span>
          <span>BTW betaald</span>
          <span className="text-right">€ 112,96</span>
        </div>
        <div className="border-t border-[#1A1A2E] my-3" />
        <div className="grid grid-cols-[1fr_auto]">
          <span className="font-bold">af te dragen</span>
          <span className="text-right font-bold text-sm">€ 2.317,61</span>
        </div>
        <div className="mt-5 pt-3 border-t border-dashed border-[#1A1A2E]/30">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#636E72]">deadline</span>
            <span className="font-bold">30 apr 2026</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-[#636E72]">gebaseerd op</span>
            <span>27 transacties</span>
          </div>
        </div>
        <div className="text-center mt-5 text-[10px] text-[#636E72]">
          nu nog zelf invullen op belastingdienst.nl.
        </div>
      </div>

      <div className="absolute -right-2 -top-2 md:-right-6 md:-top-6 border-2 border-[#B5651D] text-[#B5651D] px-3 py-2 rotate-[8deg] font-mono text-[10px] tracking-widest uppercase bg-[#F5F3EF]">
        5 min
        <br />
        werk
      </div>
    </div>
  );
}
