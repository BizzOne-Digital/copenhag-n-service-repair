import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Copenhagen Service and Repair",
  description: "Your lift truck specialist in Southwest Ontario.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
