"use client";

import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", desc: "Overzicht" },
  { label: "Transacties", href: "/transactions", desc: "Inkomsten & uitgaven" },
  { label: "Facturen", href: "/invoices", desc: "Klanten factureren" },
  { label: "BTW-aangifte", href: "/btw", desc: "Kwartaalberekening" },
  { label: "Instellingen", href: "/settings", desc: "Account & bankrekeningen" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#E0DCD5] p-6 flex flex-col">
      <span className="text-xl font-bold text-[#0D9668] tracking-wider">KLAARBOEK</span>
      <nav className="mt-8 flex flex-col gap-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`px-4 py-2.5 rounded-lg ${
              pathname === item.href
                ? "bg-[#0D9668] text-white"
                : "text-[#1A1A2E] hover:bg-[#EDEAE4]"
            }`}
          >
            <span className="text-sm font-medium block">{item.label}</span>
            <span className={`text-xs block ${
              pathname === item.href ? "text-white/70" : "text-[#636E72]"
            }`}>{item.desc}</span>
          </a>
        ))}
      </nav>
      <button
        onClick={() => { api.clearToken(); router.push("/login"); }}
        className="mt-auto pt-8 text-sm text-[#636E72] hover:text-red-500"
      >
        Uitloggen
      </button>
    </aside>
  );
}
