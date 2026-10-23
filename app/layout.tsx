import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Shrikhand } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const shrikhand = Shrikhand({
  variable: "--font-shrikhand",
  subsets: ["latin"],
  weight: "400",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swoop",
  description: "Better from up here. Shot on Swoop One.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0b0f19",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${shrikhand.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
