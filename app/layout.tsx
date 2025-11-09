import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sensory Dashboard - Focus Mixer",
  description: "Mix audio and visuals to create your perfect focus environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
