import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NoJsScript } from "@/components/layout/no-js-script";
import { PageEnter } from "@/components/ui/page-enter";
import "./globals.css";

/**
 * Archivo carries both display and body. One grotesque for both is the
 * brutalist move — contrast comes from weight and size, not a second face.
 *
 * The `wdth` axis is what makes the hero possible: Space Grotesk (the
 * generator's suggestion) caps at wght 700 and cannot reach the 900 the
 * style spec requires.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
});

/** The only face allowed to render a number. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const SITE_URL = "https://vinh-tran.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vinh Tran — Backend & Infrastructure Engineer",
    template: "%s — Vinh Tran",
  },
  description:
    "Backend and infrastructure engineer. Purdue CS. I build systems that hold up under load — a 375K ops/sec Redis server, sub-100ms live market data, and Kafka pipelines that cut order processing in half.",
  authors: [{ name: "Vinh Tran" }],
  creator: "Vinh Tran",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Vinh Tran",
    title: "Vinh Tran — Backend & Infrastructure Engineer",
    description:
      "Purdue CS. Systems that hold up under load: 375K ops/sec Redis server, sub-100ms live market data, Kafka pipelines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinh Tran — Backend & Infrastructure Engineer",
    description:
      "Purdue CS. Systems that hold up under load: 375K ops/sec Redis server, sub-100ms live market data, Kafka pipelines.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Zoom is never disabled. `viewportFit` covers notched devices. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // `no-js` is stripped before first paint by NoJsScript. If JS never
      // runs, the class stays and the reveal CSS never hides anything.
      className={`no-js ${archivo.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <NoJsScript />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <ThemeProvider>
          <PageEnter>{children}</PageEnter>
        </ThemeProvider>
      </body>
    </html>
  );
}
