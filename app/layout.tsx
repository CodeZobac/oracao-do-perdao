import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Oração do perdão Cristina Cairo",
  description: "Oração do perdão Cristina Cairo",
  openGraph: {
    title: "Oração do perdão Cristina Cairo",
    description: "Oração do perdão Cristina Cairo",
    siteName: "Oração do perdão Cristina Cairo",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary",
    title: "Oração do perdão Cristina Cairo",
    description: "Oração do perdão Cristina Cairo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
