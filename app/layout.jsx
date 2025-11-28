import "./globals.css";
import PageTransition from "./PageTransition";
import ScrollPerf from "./ScrollPerf";
import GlobalBackgrounds from "./components/GlobalBackgrounds";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "fokusai-generator-veo",
  description: "Frontend Next.js untuk demo Labs Flow Proxy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="color-scheme" content="dark" />
        <style>{`html,body{background:#000;color:#f5f7fb}`}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalBackgrounds />
        <ScrollPerf />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
