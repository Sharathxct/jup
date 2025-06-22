'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="h-[52px] bg-[#111827]/50 border-b border-[#1F2937] px-6 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M122.363 90.3495C117.674 95.9288 117.674 104.071 122.363 109.65L160.767 155.349C168.968 165.108 162.031 180 149.284 180H51.0288C38.2821 180 31.3446 165.108 39.5454 155.349L77.9499 109.65C82.6386 104.071 82.6386 95.9288 77.9498 90.3495L39.5453 44.6504C31.3446 34.8921 38.2821 20 51.0288 20L149.284 20C162.03 20 168.968 34.8921 160.767 44.6504L122.363 90.3495Z" fill="url(#paint0_linear_105_736)"/>
                <defs>
                  <linearGradient id="paint0_linear_105_736" x1="149.557" y1="20" x2="39.7213" y2="117.692" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B0B9FF"/>
                    <stop offset="1" stopColor="#E7E9FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-white font-medium">Blaze</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/pulse" className={`${pathname === '/pulse' ? 'text-blue-400' : 'text-gray-400'}`}>Pulse</Link>
            <Link href="/portfolio" className={`${pathname === '/portfolio' ? 'text-blue-400' : 'text-gray-400'}`}>Portfolio</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !h-8 !py-0" />
        </div>
      </div>
    </nav>
  );
} 