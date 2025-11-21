import type { Metadata } from "next";
import { Luckiest_Guy, Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const luckiestGuy = Luckiest_Guy({
  variable: "--font-luckiest-guy",
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
        className={`${luckiestGuy.variable} ${quicksand.variable} antialiased font-quicksand`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
