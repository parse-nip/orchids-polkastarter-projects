import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Web3Provider } from "@/context/web3-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "3SEARCH Capital - Web3 Venture Capital",
  description: "3SEARCH Capital is a leading venture capital firm focused on the next generation of web3 projects and blockchain infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            {children}
          </Web3Provider>
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}
