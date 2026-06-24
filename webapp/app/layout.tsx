import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Molly's Song — Project Hub",
  description: "Characters, storyline, plot locations, and scripts for Molly's Song.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
