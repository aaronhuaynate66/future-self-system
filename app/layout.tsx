import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppStateProvider } from "@/lib/state";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Aaron OS — Mission Control",
  description: "Sistema operativo personal. 90 días para conseguir paz.",
  applicationName: "Aaron OS",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#010308",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen antialiased">
        <AppStateProvider>
          <div className="relative min-h-screen">
            {/* Ambient background layers */}
            <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />

            <div className="relative z-10 flex min-h-screen">
              <Sidebar />
              <div className="flex min-h-screen flex-1 flex-col">
                <Header />
                <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-16">
                  {children}
                </main>
                <MobileNav />
              </div>
            </div>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
