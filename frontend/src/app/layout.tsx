import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KlaarBoek — Boekhouding die gewoon werkt voor ZZP'ers",
  description:
    "Bookkeeping voor Nederlandse ZZP'ers: upload je bankafschrift, KlaarBoek sorteert het in de juiste categorieën en BTW-tarieven. €9,99 per maand.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "KlaarBoek — Boekhouding die gewoon werkt",
    description:
      "Voor Nederlandse ZZP'ers: bank-CSV → gesorteerd → BTW-rapport per kwartaal. €9,99 per maand.",
    url: "https://klaarboek.vercel.app",
    siteName: "KlaarBoek",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "KlaarBoek" }],
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KlaarBoek — Boekhouding die gewoon werkt",
    description:
      "Voor Nederlandse ZZP'ers. €9,99/mnd. Bank-CSV → gesorteerd → BTW-rapport.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
