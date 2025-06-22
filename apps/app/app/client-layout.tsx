'use client';

import { WalletProvider } from "@/components/WalletProvider";
import { Header } from "@/components/Header";

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WalletProvider>
      <Header />
      {children}
    </WalletProvider>
  );
} 