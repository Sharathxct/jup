import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "Blaze - The Gateway to DeFi",
  description: "The only trading platform you'll ever need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0A0A0A] text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
