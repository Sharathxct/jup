'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { 
  Bell, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LayoutGrid, 
  Maximize2, 
  Settings, 
  Share2, 
  Star,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TradingPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('0.00');
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [showSlippagePopup, setShowSlippagePopup] = useState(false);
  const [maxSlippage, setMaxSlippage] = useState('2');
  const [tipAmount, setTipAmount] = useState('0.003');
  const [frontRunProtection, setFrontRunProtection] = useState(false);
  const pathname = usePathname();

  const handleTabChange = (tab: 'buy' | 'sell') => {
    setSelectedTab(tab);
    setAmount('0.00');
  };

  const handleQuickAmountClick = (value: string) => {
    if (selectedTab === 'buy') {
      if (value === 'max') {
        // TODO: Calculate max based on wallet balance
        setAmount('1.00');
      } else {
        setAmount(value);
      }
    } else {
      // For sell mode, handle percentages
      setAmount(value.replace('%', ''));
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0A0A' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1F2937',
      },
      timeScale: {
        borderColor: '#1F2937',
        timeVisible: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    const data = [
      { time: '2024-01-01', open: 6500, high: 6850, low: 6400, close: 6800 },
      { time: '2024-01-02', open: 6800, high: 7100, low: 6700, close: 6950 },
    ];

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

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

      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Token Metadata Line */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#111827] border-b border-[#1F2937]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Token" className="w-6 h-6" />
              <span className="text-white font-medium">764</span>
              <span className="text-gray-400">Roblo.x T...</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Price: <span className="text-white">$6.51K</span></span>
              <span className="text-gray-400">Liquidity: <span className="text-white">$10.9K</span></span>
              <span className="text-gray-400">Supply: <span className="text-white">1B</span></span>
              <span className="text-gray-400">Global Fees Paid: <span className="text-white">1.221</span></span>
              <span className="text-gray-400">B.Curve: <span className="text-green-400">29.94%</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400" />
            <Share2 className="w-5 h-5 text-gray-400" />
            <Copy className="w-5 h-5 text-gray-400" />
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 relative">
          {/* Chart */}
          <div className="flex-1 h-full" ref={chartContainerRef} />

          {/* Trading Panel */}
          <div className="w-80 bg-[#1A1F2B] h-full">
            <div className="flex flex-col gap-4 p-4">
              {/* Buy/Sell Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleTabChange('buy')}
                  className={`py-3 rounded font-medium transition-colors ${
                    selectedTab === 'buy' 
                      ? 'bg-[#22C55E] text-white' 
                      : 'bg-[#1F2937] text-gray-400'
                  }`}
                >
                  buy
                </button>
                <button 
                  onClick={() => handleTabChange('sell')}
                  className={`py-3 rounded font-medium transition-colors ${
                    selectedTab === 'sell' 
                      ? 'bg-[#F87171] text-white' 
                      : 'bg-[#1F2937] text-gray-400'
                  }`}
                >
                  sell
                </button>
              </div>

              {/* Set Max Slippage Button */}
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowSlippagePopup(true)}
                  className="bg-[#1F2937] text-gray-400 py-2 px-4 rounded text-sm"
                >
                  set max slippage
                </button>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1F2937] text-white py-3 px-4 rounded"
                  placeholder="0.00"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-white">Sol</span>
                  <img src="/solana.svg" alt="SOL" className="w-5 h-5" />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              {selectedTab === 'buy' ? (
                <div className="grid grid-cols-6 gap-2">
                  <button 
                    onClick={() => handleQuickAmountClick('0')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    0
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('0.1')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    0.1
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('0.3')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    0.3
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('0.5')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    0.5
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('1')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    1
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('max')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    max
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  <button 
                    onClick={() => handleQuickAmountClick('0%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    0%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('10%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    10%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('20%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    20%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('30%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    30%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('50%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    50%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('100%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    100%
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button 
                className={`w-full text-white py-3 rounded font-medium ${
                  selectedTab === 'buy' 
                    ? 'bg-[#22C55E] hover:bg-[#1B9D4D]' 
                    : 'bg-[#F87171] hover:bg-[#EF4444]'
                }`}
              >
                {`${selectedTab} 764`}
              </button>
            </div>
          </div>

          {/* Max Slippage Popup */}
          {showSlippagePopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#1A1F2B] rounded-lg p-6 w-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-medium">Set Max Slippage</h3>
                  <button 
                    onClick={() => setShowSlippagePopup(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Maximum slippage (%)</label>
                    <input
                      type="text"
                      value={maxSlippage}
                      onChange={(e) => setMaxSlippage(e.target.value)}
                      className="w-full bg-[#1F2937] text-white py-2 px-3 rounded"
                      placeholder="Enter percentage"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    This is the maximum amount of slippage you are willing to accept when placing trades.
                  </p>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setShowSlippagePopup(false)}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
