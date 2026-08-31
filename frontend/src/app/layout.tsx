import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoBuild AI — Construction Cost Estimation",
  description:
    "AI-powered two-stage construction cost estimation platform for Tamil Nadu. ML quantity prediction meets live rate management for transparent, always-current project estimates.",
  keywords: ["construction cost", "Tamil Nadu", "building estimate", "EcoBuild"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
