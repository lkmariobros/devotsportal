import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { TRPCProvider } from "@/providers/trpc-provider";
import { TanstackQueryProvider } from "@/providers/query-provider";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scheme-only-dark" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <TanstackQueryProvider>
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}