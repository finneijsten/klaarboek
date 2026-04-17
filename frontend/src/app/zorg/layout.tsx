import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KlaarBoek voor Fysiotherapeuten — Boekhouden zonder gedoe",
  description:
    "Boekhoudprogramma specifiek voor zelfstandige fysiotherapeuten: BTW-vrijstelling " +
    "zorgdiensten automatisch, AGB-code op factuur, declaratie-overzicht per " +
    "zorgverzekeraar. €9,99/mnd.",
  openGraph: {
    title: "KlaarBoek voor Fysiotherapeuten — Boekhouden zonder gedoe",
    description:
      "BTW-vrijstelling automatisch, AGB-code op factuur, declaratie-overzicht per verzekeraar. €9,99/mnd.",
    url: "https://klaarboek.vercel.app/zorg",
    siteName: "KlaarBoek",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KlaarBoek voor Fysiotherapeuten",
    description:
      "BTW-vrijstelling automatisch, AGB-code op factuur. €9,99/mnd.",
  },
};

export default function ZorgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
