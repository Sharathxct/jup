'use client';

import { Bell, Settings, ChevronDown, TrendingUp, TrendingDown, RotateCcw, Info, Star} from 'lucide-react';
import Link from 'next/link';
import { usePulseWebSocket, useEnhancedToken } from '@/services/pulse/query';
import type { ProcessedToken } from '@/services/pulse/api';
import { useState } from 'react';

interface Coin {
  id: number | string;
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change: string;
  changePercent: number;
  marketCap: string;
  volume: string;
  age: string;
  holders: number;
  txns: number;
  chart: string;
  tags: string[];
}

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

function FilterPopup({ isOpen, onClose }: FilterPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[#111827] w-[480px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-white">Filters</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Filter Sections */}
        <div className="space-y-6">
          {/* Section Tabs */}
          <div className="flex items-center gap-4 border-b border-[#1F2937] pb-4">
            <button className="flex items-center gap-1 text-white">
              New Pairs
              <span className="bg-blue-600 text-xs px-1.5 rounded-full">1</span>
            </button>
            <button className="flex items-center gap-1 text-white">
              Final Stretch
              <span className="bg-blue-600 text-xs px-1.5 rounded-full">1</span>
            </button>
            <button className="text-gray-400">Migrated</button>
            <RotateCcw className="w-4 h-4 text-gray-400 ml-auto" />
          </div>

          {/* Protocols */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Protocols</h3>
            <div className="flex flex-wrap gap-2">
              <button className="bg-green-600/20 text-green-400 px-3 py-1 text-sm">🟢 Pump</button>
              <button className="bg-[#1F2937] text-[#60A5FA] px-3 py-1 text-sm">🔵 LaunchLab</button>
              <button className="bg-[#1F2937] text-orange-400 px-3 py-1 text-sm">🟠 Bonk</button>
              <button className="bg-[#1F2937] text-pink-400 px-3 py-1 text-sm">🔴 Dynamic BC</button>
              <button className="bg-[#1F2937] text-green-400 px-3 py-1 text-sm">🟢 Launch a Coin</button>
              <button className="bg-[#1F2937] text-blue-400 px-3 py-1 text-sm">🔵 Boop</button>
              <button className="bg-[#1F2937] text-yellow-400 px-3 py-1 text-sm">🟡 Moonit</button>
              <button className="bg-[#1F2937] text-gray-400 px-3 py-1 text-sm">⚪ Raydium</button>
              <button className="bg-[#1F2937] text-gray-400 px-3 py-1 text-sm">⚪ Pump AMM</button>
              <button className="bg-[#1F2937] text-gray-400 px-3 py-1 text-sm">⚪ Meteora AMM</button>
              <button className="bg-[#1F2937] text-gray-400 px-3 py-1 text-sm">⚪ Meteora AMM V2</button>
            </div>
          </div>

          {/* Search Keywords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Search Keywords</label>
              <input 
                type="text" 
                placeholder="keyword1, keyword2..." 
                className="w-full bg-[#1F2937] text-white border-0 p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Exclude Keywords</label>
              <input 
                type="text" 
                placeholder="keyword1, keyword2..." 
                className="w-full bg-[#1F2937] text-white border-0 p-2 text-sm"
              />
            </div>
          </div>

          {/* B. curve % */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">B. curve %</label>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Min" 
                className="w-full bg-[#1F2937] text-white border-0 p-2 text-sm"
              />
              <input 
                type="text" 
                placeholder="Max" 
                className="w-full bg-[#1F2937] text-white border-0 p-2 text-sm"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 border-b border-[#1F2937] pb-4">
            <button className="text-white">Audit</button>
            <button className="flex items-center gap-1 text-white">
              $ Metrics
              <Info className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-1 text-white">
              Socials
              <span className="bg-blue-600 text-xs px-1.5 rounded-full">1</span>
            </button>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox bg-[#1F2937] border-0" />
                <span className="ml-2 text-gray-400">Twitter</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox bg-[#1F2937] border-0" />
                <span className="ml-2 text-gray-400">Website</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox bg-[#1F2937] border-0" />
                <span className="ml-2 text-gray-400">Telegram</span>
              </label>
            </div>
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox bg-[#1F2937] border-0" checked />
              <span className="ml-2 text-gray-400">At Least One Social</span>
            </label>
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <button className="bg-[#1F2937] text-white px-4 py-1.5">Import</button>
              <button className="bg-[#1F2937] text-white px-4 py-1.5">Export</button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-1.5">Apply All</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinCard({ coin }: { coin: Coin }) {
  const isPositive = coin.changePercent > 0;
  
  return (
    <Link href={`/meme/${coin.id}`}>
    <div className="bg-[#1A1F2B] p-4 hover:bg-[#1E2433] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F2937] flex items-center justify-center text-xl">
            {coin.icon}
          </div>
          <div>
            <div className="font-medium text-white">{coin.name}</div>
            <div className="text-sm text-gray-400">{coin.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium text-[#60A5FA]">{coin.price}</div>
          <div className="text-sm text-gray-300">{coin.change}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#1F2937] px-2 py-0.5 text-gray-300">{coin.age}</span>
          <span className="text-xs text-gray-400">👥 {coin.holders}</span>
          <span className="text-xs text-gray-400">📊 {coin.txns}</span>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm">{Math.abs(coin.changePercent)}%</span>
        </div>
      </div>
      
      <div className="flex gap-1.5 flex-wrap">
        {coin.tags.map((tag: string, index: number) => (
          <span key={index} className={`text-xs px-2 py-0.5 ${
            tag === 'Paid' ? 'bg-green-600/20 text-green-400' : 
            tag === 'DS' ? 'bg-blue-600/20 text-blue-400' : 
            'bg-[#1F2937] text-gray-300'
          }`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
    </Link>
  );
}

// Enhanced coin card component for real-time tokens
function EnhancedCoinCard({ token }: { token: ProcessedToken }) {
  const enhancedToken = useEnhancedToken(token);
  const isPositive = enhancedToken.changePercent > 0;
  
  return (
    <Link href={`/meme/${enhancedToken.id}`}>
    <div className="bg-[#1A1F2B] p-4 hover:bg-[#1E2433] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F2937] flex items-center justify-center text-xl relative">
            {enhancedToken.isLoadingMetadata ? (
              <div className="animate-pulse bg-gray-600 w-6 h-6 rounded"></div>
            ) : (
              enhancedToken.metadata?.image ? (
                <img 
                  src={enhancedToken.metadata.image} 
                  alt={enhancedToken.name}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = enhancedToken.icon;
                  }}
                />
              ) : enhancedToken.icon
            )}
          </div>
          <div>
            <div className="font-medium text-white">
              {enhancedToken.isLoadingMetadata ? (
                <div className="animate-pulse bg-gray-600 h-4 w-20 rounded"></div>
              ) : (
                enhancedToken.name
              )}
            </div>
            <div className="text-sm text-gray-400">
              {enhancedToken.isLoadingMetadata ? (
                <div className="animate-pulse bg-gray-600 h-3 w-12 rounded mt-1"></div>
              ) : (
                enhancedToken.symbol
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium text-[#60A5FA]">{enhancedToken.price}</div>
          <div className="text-sm text-gray-300">{enhancedToken.change}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#1F2937] px-2 py-0.5 text-gray-300">{enhancedToken.age}</span>
          <span className="text-xs text-gray-400">👥 {enhancedToken.holders}</span>
          <span className="text-xs text-gray-400">📊 {enhancedToken.txns}</span>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm">{Math.abs(enhancedToken.changePercent)}%</span>
        </div>
      </div>
      
      <div className="flex gap-1.5 flex-wrap">
        {enhancedToken.tags.map((tag: string, index: number) => (
          <span key={index} className={`text-xs px-2 py-0.5 ${
            tag === 'Paid' ? 'bg-green-600/20 text-green-400' : 
            tag === 'DS' ? 'bg-blue-600/20 text-blue-400' : 
            'bg-[#1F2937] text-gray-300'
          }`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
    </Link>
  );
}

function CoinSection({ title, coins, realTimeTokens, isInitialLoading }: { 
  title: string; 
  coins?: Coin[]; 
  realTimeTokens?: ProcessedToken[];
  isInitialLoading?: boolean;
  icon?: string;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isRealTime = title === "New Pairs" || title === "Final Stretch" || title === "Migrated";
  const displayCoins = isRealTime ? [] : (coins || []);
  const displayTokens = isRealTime ? (realTimeTokens || []) : [];

  return (
    <div className="bg-[#111827] flex flex-col h-[calc(100vh-13rem)]">
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          {isRealTime && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="bg-[#1A1F2B] hover:bg-[#1E2433] text-gray-400 hover:text-gray-300 px-2 py-1">
            ⚡ {displayTokens.length || displayCoins.length}
          </button>
          <button 
            className="bg-[#1A1F2B] hover:bg-[#1E2433] text-gray-400 hover:text-gray-300 px-2 py-1 ml-1"
            onClick={() => setIsFilterOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-px overflow-y-auto flex-1">
        {isRealTime ? (
          isInitialLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <div className="animate-spin mb-2 text-2xl">⚡</div>
                <div>Loading {title.toLowerCase()}...</div>
              </div>
            </div>
          ) : displayTokens.length > 0 ? (
            displayTokens.map((token, index) => (
              <EnhancedCoinCard key={`${token.mintAddress}-${token.timestamp}-${index}`} token={token} />
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <div className="animate-pulse mb-2">🔄</div>
                <div>Waiting for {title.toLowerCase()}...</div>
              </div>
            </div>
          )
        ) : (
          displayCoins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))
        )}
      </div>
      <FilterPopup isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}

export default function PulsePage() {
  const { newTokens, finalStretchTokens, migratedTokens, isLoading, isLoadingInitialData, isConnected } = usePulseWebSocket();

  return (
    <div className=" bg-black">
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium text-white">Pulse</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#1A1F2B] hover:bg-[#1E2433] text-white px-3 py-1.5 flex items-center gap-2">
              <span>Display</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <Star className="w-5 h-5 text-gray-400 hover:text-gray-300" />
            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-300" />
            <Settings className="w-5 h-5 text-gray-400 hover:text-gray-300" />
          </div>
        </div>

        {/* Three Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 px-2">
          <CoinSection 
            title="New Pairs" 
            realTimeTokens={newTokens}
            isInitialLoading={isLoadingInitialData}
          />
          <CoinSection 
            title="Final Stretch" 
            realTimeTokens={finalStretchTokens}
            isInitialLoading={isLoadingInitialData}
          />
          <CoinSection 
            title="Migrated" 
            realTimeTokens={migratedTokens}
            isInitialLoading={isLoadingInitialData}
          />
        </div>
      </div>

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
    </div>
  );
}
