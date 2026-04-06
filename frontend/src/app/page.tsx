import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#E0DCD5]">
        <span className="text-xl font-bold text-[#0D9668] tracking-wider">KLAARBOEK</span>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#2D3436] hover:text-[#0D9668]">
            Inloggen
          </Link>
          <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-[#0D9668] text-white rounded-lg hover:bg-[#0A7B55]">
            Gratis starten
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-[#EDE9E3] to-[#F5F3EF]">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1A1A2E] mb-6 max-w-3xl leading-tight">
          Boekhouding op <span className="text-[#0D9668]">autopilot</span> voor ZZP&apos;ers
        </h1>
        <p className="text-lg text-[#636E72] mb-8 max-w-xl">
          Koppel je bank, en KlaarBoek doet de rest. Automatische transactieclassificatie,
          BTW-aangifte en financieel overzicht.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <input
            type="email"
            placeholder="je@email.nl"
            className="px-6 py-3 border-2 border-[#D5D0C8] rounded-xl bg-white text-[#2D3436] w-80 outline-none focus:border-[#0D9668]"
          />
          <button className="px-6 py-3 bg-[#0D9668] text-white font-bold rounded-xl hover:bg-[#0A7B55] transition-all">
            Schrijf je in
          </button>
        </div>
        <p className="text-sm text-[#B2BEC3] mt-3">Gratis. Geen spam. We laten je weten wanneer we live gaan.</p>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#EDEAE4]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {[
            { num: "1.2M", label: "ZZP'ers in Nederland" },
            { num: "95%", label: "Automatische classificatie" },
            { num: "€9,99", label: "Per maand, alles inclusief" },
            { num: "0", label: "Handmatige invoer nodig" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-[#0D9668]">{s.num}</div>
              <div className="text-[#636E72] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-[#1A1A2E] mb-2">
          Alles wat je nodig hebt. <span className="text-[#0D9668]">Niets meer.</span>
        </h2>
        <p className="text-center text-[#636E72] text-lg mb-16">
          KlaarBoek vervangt je boekhouder, niet je verstand.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🏦", title: "Bank sync", desc: "Koppel ING, Rabo of ABN AMRO via PSD2 Open Banking." },
            { icon: "🤖", title: "AI-classificatie", desc: "95%+ automatische categorisatie van transacties." },
            { icon: "📈", title: "BTW op autopilot", desc: "Automatische BTW-berekening per kwartaal." },
            { icon: "📄", title: "Facturen", desc: "Professionele facturen in seconden." },
            { icon: "📊", title: "Dashboard", desc: "Inkomsten, uitgaven en BTW in een oogopslag." },
            { icon: "🔒", title: "Veilig", desc: "GDPR-compliant. Data versleuteld." },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-[#E0DCD5] rounded-2xl p-6 hover:border-[#0D9668] hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{f.title}</h3>
              <p className="text-[#636E72]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[#B2BEC3] text-sm border-t border-[#E0DCD5] bg-white">
        &copy; 2026 KlaarBoek. Gebouwd door het Bot Squad.
      </footer>
    </div>
  );
}
