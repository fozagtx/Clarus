import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Clarus",
  description: "Binance Agent OS Track A skill. BNB Chain six-gate firewall. No keys.",
  applicationName: "Clarus",
  icons: {
    icon: "/clarus-mark.png",
    apple: "/clarus-mark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={plex.variable}>{children}</body>
    </html>
  );
}
