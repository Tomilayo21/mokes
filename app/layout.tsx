
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import AnnouncementBar from "@/components/AnnouncementBar";
import { AppContextProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Providers from "./provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Mokés",
  description: "MOKÉS is a modern clothing brand offering stylish streetwear, new arrivals, and exclusive fashion drops for everyday wear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <AppContextProvider>
            <AnnouncementBar />
            <Navbar />
            <Toaster position="top-right" />
            {children}
          </AppContextProvider>
        </Providers>
      </body>
    </html>
  );
}