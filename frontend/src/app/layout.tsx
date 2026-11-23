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
  metadataBase: new URL('https://hyperniche.in'),
  title: "Hyperniche — Creator & Brand Deals Marketplace",
  description: "An Indian marketplace where business owners find content creators to promote their products, and creators find paid brand deals.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hyperniche — Creator & Brand Deals Marketplace",
    description: "An Indian marketplace where business owners find content creators to promote their products, and creators find paid brand deals.",
    url: 'https://hyperniche.in',
    siteName: 'Hyperniche',
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyperniche — Creator & Brand Deals Marketplace",
    description: "An Indian marketplace where business owners find content creators to promote their products, and creators find paid brand deals.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hyperniche.in/#organization",
      "name": "Hyperniche",
      "url": "https://hyperniche.in",
      "description": "An Indian marketplace connecting specialized creators with forward-thinking brands across 15 verticals.",
      "founder": [
        {
          "@type": "Person",
          "name": "Akshit Vashisht"
        },
        {
          "@type": "Person",
          "name": "Srish Tiwari"
        },
        {
          "@type": "Person",
          "name": "Divansh Kaler"
        }
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "BUSZ Pvt. Ltd."
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@hyperniche.in"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://hyperniche.in/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who is behind Hyperniche?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hyperniche is founded by Akshit Vashisht, Srish Tiwari, and Divansh Kaler, in association with BUSZ Pvt. Ltd., with a shared vision of building meaningful connections between creators and brands."
          }
        },
        {
          "@type": "Question",
          "name": "Does Hyperniche deduct fees from creator payouts?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Never. For creators, joining, publishing a profile, and pitching deals is entirely free. You receive 100% of your agreed commercial fee with no hidden agency cuts taken from your earnings."
          }
        },
        {
          "@type": "Question",
          "name": "How are brands and posting representatives authenticated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We evaluate brand accounts against their verified corporate domain, official web presence, and business email signatures. The actual individual posting the campaign is also validated separately to ensure authentic representation."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mode="light" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = sessionStorage.getItem('hyperniche_theme_preference');
                if (s === 'dark') {
                  document.documentElement.setAttribute('data-mode', 'dark');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.setAttribute('data-mode', 'light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                document.documentElement.setAttribute('data-mode', 'light');
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${archivo.className} antialiased selection:bg-[#F06A4D]/20 selection:text-[#F06A4D]`}>
        {children}
      </body>
    </html>
  );
}
