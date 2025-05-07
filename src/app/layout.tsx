import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

// Import the PortalProvider dynamically to avoid SSR issues
import dynamic from 'next/dynamic';

// Dynamically import the PortalProvider with SSR disabled
const PortalProviderClient = dynamic(
  () => import('@/providers/portal-provider'),
  { ssr: false }
);

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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Use the dynamically imported PortalProvider */}
          <PortalProviderClient>
            {children}
            <Toaster />
          </PortalProviderClient>
        </ThemeProvider>
      </body>
    </html>
  );
}