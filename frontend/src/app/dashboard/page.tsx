export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-[#E0DCD5] p-6">
          <span className="text-xl font-bold text-[#0D9668] tracking-wider">KLAARBOEK</span>
          <nav className="mt-8 flex flex-col gap-2">
            {[
              { label: "Dashboard", active: true },
              { label: "Transacties", active: false },
              { label: "Facturen", active: false },
              { label: "BTW-aangifte", active: false },
              { label: "Instellingen", active: false },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  item.active
                    ? "bg-[#0D9668] text-white"
                    : "text-[#636E72] hover:bg-[#EDEAE4]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">Dashboard</h1>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Inkomsten deze maand", value: "€4.250", trend: "+12%" },
              { label: "Uitgaven deze maand", value: "€1.830", trend: "-5%" },
              { label: "BTW schuld Q2", value: "€508", trend: "" },
              { label: "Winst YTD", value: "€14.720", trend: "+8%" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
                <p className="text-sm text-[#636E72] mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{card.value}</p>
                {card.trend && (
                  <p className={`text-sm mt-1 ${card.trend.startsWith("+") ? "text-[#0D9668]" : "text-red-500"}`}>
                    {card.trend}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-[#E0DCD5] p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Recente transacties</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#636E72] border-b border-[#E0DCD5]">
                  <th className="pb-3">Datum</th>
                  <th className="pb-3">Omschrijving</th>
                  <th className="pb-3">Categorie</th>
                  <th className="pb-3">BTW</th>
                  <th className="pb-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "05 apr", desc: "Albert Heijn", cat: "Boodschappen", btw: "9%", amount: "-€42,50", type: "expense" },
                  { date: "04 apr", desc: "Klant: WebDesign BV", cat: "Inkomsten", btw: "21%", amount: "+€1.200,00", type: "income" },
                  { date: "03 apr", desc: "Coolblue", cat: "Kantoorartikelen", btw: "21%", amount: "-€89,99", type: "expense" },
                  { date: "02 apr", desc: "Klant: Studio Groen", cat: "Inkomsten", btw: "21%", amount: "+€750,00", type: "income" },
                  { date: "01 apr", desc: "KPN Zakelijk", cat: "Telefoonkosten", btw: "21%", amount: "-€35,00", type: "expense" },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-[#E0DCD5] last:border-0">
                    <td className="py-3 text-sm text-[#636E72]">{tx.date}</td>
                    <td className="py-3 text-sm text-[#1A1A2E] font-medium">{tx.desc}</td>
                    <td className="py-3">
                      <span className="text-xs bg-[#EDEAE4] text-[#636E72] px-2 py-1 rounded-full">{tx.cat}</span>
                    </td>
                    <td className="py-3 text-sm text-[#636E72]">{tx.btw}</td>
                    <td className={`py-3 text-sm text-right font-medium ${tx.type === "income" ? "text-[#0D9668]" : "text-[#1A1A2E]"}`}>
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
