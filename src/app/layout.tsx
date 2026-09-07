import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Clarus",
  description:
    "On-chain clarity agent. Four-layer risk firewall. You remain the execution layer.",
  applicationName: "Clarus",
  icons: {
    icon: "/clarus-mark.png",
    apple: "/clarus-mark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${plex.variable}`}>{children}</body>
    </html>
  );
}
