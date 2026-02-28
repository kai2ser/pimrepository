import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ScrollText, Info, Globe, Download } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PIM Country Policy Profile Repository",
  description: "Public Investment Management – Country Policy Profile Repository",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        {/* Top navigation */}
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center leading-none">
                <Image
                  src="/pim-pam-logo.png"
                  alt="PIM PAM"
                  height={40}
                  width={120}
                  priority
                  className="h-10 w-auto"
                />
              </Link>

              <nav className="flex items-center gap-1">
                <Link
                  href="/about"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  About
                </Link>
                <Link
                  href="/release-notes"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <ScrollText className="h-3.5 w-3.5" />
                  Release Notes
                </Link>
                <Link
                  href="/countries"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Countries
                </Link>
                <Link
                  href="/download"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Repository
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t mt-16 py-6 text-center text-xs text-muted-foreground">
          PIM Country Policy Profile Repository · Public Investment Management
        </footer>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
