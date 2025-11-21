import type { Metadata } from "next";
import { Bungee, Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: ["400"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shoe Shoe | Children's Shoe Marketplace",
  description: "Buy and sell children's shoes - singles or pairs!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bungee.variable} ${quicksand.variable} antialiased font-quicksand`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
