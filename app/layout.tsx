import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import "sileo/styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SileoToasterProvider } from "@/components/sileo-provider";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vlink.cognilab.dev"),
  title: {
    default: "VLink | Agendamiento Profesional sin Fricciones",
    template: "%s | VLink",
  },
  description: "La plataforma de gestión de citas más rápida para profesionales. Sincronización con Google Calendar, pagos integrados y validación por WhatsApp.",
  keywords: ["agendamiento", "citas", "profesionales", "google calendar", "vlink", "booking"],
  authors: [{ name: "Cognilab" }],
  creator: "Cognilab",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://vlink.cognilab.dev",
    title: "VLink | Agendamiento Profesional sin Fricciones",
    description: "Sincronización con Google Calendar y validación por WhatsApp para profesionales.",
    siteName: "VLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "VLink | Agendamiento Profesional sin Fricciones",
    description: "La plataforma de gestión de citas más rápida para profesionales.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <SileoToasterProvider />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VLink",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Plataforma de agendamiento profesional con sincronización de Google Calendar.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Cognilab",
                "url": "https://vlink.cognilab.dev"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
