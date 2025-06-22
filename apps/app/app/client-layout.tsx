'use client';

import { WalletProvider } from "@/components/WalletProvider";

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
} 