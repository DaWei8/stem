import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});


export const metadata: Metadata = {
  title: "STEM | System Technical Engine Manager",
  description: "Deterministic System Design Tool for Elite Engineers",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "STEM",
  },
  formatDetection: {
    telephone: false,
  },
};

import { ResponsiveGuard } from "@/components/layout/ResponsiveGuard";
import { PWARegister } from "@/components/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-heading text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PWARegister />
          <ResponsiveGuard>
            {children}
          </ResponsiveGuard>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '0px',
                fontSize: '10px',
                fontWeight: 'bold',
              },
              className: "font-mono",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
