import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Hyperniche — Creator & Brand Deals Marketplace",
  description: "An Indian marketplace where business owners find content creators to promote their products, and creators find paid brand deals.",
  openGraph: {
    title: "Hyperniche — Creator & Brand Deals Marketplace",
    description: "An Indian marketplace where business owners find content creators to promote their products, and creators find paid brand deals.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mode="light" className={archivo.variable} suppressHydrationWarning>
      <body className={`${archivo.className} antialiased selection:bg-[#F06A4D]/20 selection:text-[#F06A4D]`}>
        {children}
      </body>
    </html>
  );
}
