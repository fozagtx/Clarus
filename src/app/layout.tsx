import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Clarus",
  description:
    "Binance Agent OS Track A agent for BNB Chain. Six-gate risk firewall. You remain the execution layer.",
  applicationName: "Clarus",
  keywords: [
    "Binance Agent OS",
    "BNB Chain",
    "Clarus",
    "on-chain firewall",
    "GoPlus",
    "PancakeSwap",
  ],
  icons: {
    icon: "/clarus-mark.png",
    apple: "/clarus-mark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${plex.variable} relative overscroll-none font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
