import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "./components/homepage/providers/AppProvider";
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "MIJI",
  description: "Best booking experience for travel agents in the Middle East and South Asia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}