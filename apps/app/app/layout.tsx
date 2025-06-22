import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import TanstackProvider from "@/lib/tanstack";

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
        <TanstackProvider>
          <ClientLayout>{children}</ClientLayout>
        </TanstackProvider>
      </body>
    </html>
  );
}
