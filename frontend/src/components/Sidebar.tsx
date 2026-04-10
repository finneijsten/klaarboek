"use client";

import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transacties", href: "/transactions" },
  { label: "Facturen", href: "/invoices" },
  { label: "BTW-aangifte", href: "/btw" },
  { label: "Instellingen", href: "/settings" },
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
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              pathname === item.href
                ? "bg-[#0D9668] text-white"
                : "text-[#636E72] hover:bg-[#EDEAE4]"
            }`}
          >
            {item.label}
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
