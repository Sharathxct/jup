'use client';

import { useState } from 'react';
import { Search, Copy, ArrowDownToLine, Bell, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState('Wallets');
  const [showArchived, setShowArchived] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-[#111827]/50 border-b border-[#1F2937] px-6 py-3">
        <div className="flex items-center justify-between">
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5">
              connect
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111827]/90 border-t border-[#1F2937]">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">1 ≡ 0</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <button className="bg-[#1A1F2B] hover:bg-[#1E2433] text-white px-3 py-1.5">
              <span className="text-sm">Wallet Tracker</span>
            </button>
            <button className="bg-[#1A1F2B] hover:bg-[#1E2433] text-white px-3 py-1.5">
              <span className="text-sm">Twitter Tracker</span>
            </button>
            <button className="bg-[#1A1F2B] hover:bg-[#1E2433] text-white px-3 py-1.5">
              <span className="text-sm">PnL Tracker</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-400">$142.2</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-400">Connection is stable</span>
            </div>
            <span className="text-sm text-gray-400">US-E</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-300" />
            <Settings className="w-5 h-5 text-gray-400 hover:text-gray-300" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-sm">Blaze Main</div>
            <div className="flex items-center gap-1 text-sm text-blue-500">
              0
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or address"
              className="w-full bg-[#111827] text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="form-checkbox h-4 w-4 rounded bg-[#111827] border-gray-600"
              />
              Show Archived
            </label>
            <button className="px-3 py-1.5 text-sm bg-[#111827] text-gray-400 rounded-lg hover:bg-[#1F2937]">
              Import
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Wallet
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#111827] text-gray-400 rounded-lg hover:bg-[#1F2937]">
              Source wallets
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm text-gray-400 border-b border-[#1F2937]">
            <div>Wallet</div>
            <div>Balance</div>
            <div>Holdings</div>
            <div>Actions</div>
          </div>

          {/* Wallet Row */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm hover:bg-[#1F2937]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                AX
              </div>
              <div>
                <div className="font-medium">Blaze Main</div>
                <div className="flex items-center gap-1 text-gray-400">
                  <span>9n6b...Fn5k</span>
                  <button className="hover:text-gray-300">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span>0</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Add action buttons here */}
            </div>
          </div>

          {/* Drop Zone */}
          <div className="flex flex-col items-center justify-center p-12 border-t border-[#1F2937] text-gray-400">
            <ArrowDownToLine className="w-8 h-8 mb-2" />
            <div className="text-sm">Drag wallets to distribute SOL</div>
          </div>
        </div>

        {/* Destination Section */}
        <div className="mt-6">
          <div className="text-sm text-gray-400 mb-2">Destination</div>
          <div className="bg-[#111827] rounded-lg">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm text-gray-400 border-b border-[#1F2937]">
              <div>Wallet</div>
              <div>Balance</div>
              <div>Holdings</div>
              <div>Actions</div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Start Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}