'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, ColorType, CrosshairMode } from 'lightweight-charts';
import { 
  Bell, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LayoutGrid, 
  Maximize2, 
  Settings, 
  Share2, 
  Star 
} from 'lucide-react';

export default function TradingPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('0.0');
  const [selectedTab, setSelectedTab] = useState('Market');

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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    const data = [
      { time: '2024-01-01', open: 6500, high: 6850, low: 6400, close: 6800 },
      { time: '2024-01-02', open: 6800, high: 7100, low: 6700, close: 6950 },
      // Add more data points...
    ];

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Token" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-semibold">PEPE</h1>
              <p className="text-sm text-gray-400">$0.00000123</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400" />
            <Share2 className="w-5 h-5 text-gray-400" />
            <Copy className="w-5 h-5 text-gray-400" />
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">24h Volume:</span>
            <span>$1.2M</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Market Cap:</span>
            <span>$420M</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            <Settings className="w-5 h-5 text-gray-400" />
            <LayoutGrid className="w-5 h-5 text-gray-400" />
            <Maximize2 className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Chart */}
        <div className="flex-1" ref={chartContainerRef} />

        {/* Trading Panel */}
        <div className="w-80 border-l border-[#1F2937] p-4">
          <div className="flex gap-2 mb-4">
            <button 
              className={`flex-1 py-2 rounded ${selectedTab === 'Market' ? 'bg-[#1F2937] text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedTab('Market')}
            >
              Market
            </button>
            <button 
              className={`flex-1 py-2 rounded ${selectedTab === 'Limit' ? 'bg-[#1F2937] text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedTab('Limit')}
            >
              Limit
            </button>
            <button 
              className={`flex-1 py-2 rounded ${selectedTab === 'Advanced' ? 'bg-[#1F2937] text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedTab('Advanced')}
            >
              Advanced
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Amount</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1F2937] rounded px-3 py-2 text-white"
                />
                <button className="bg-[#1F2937] px-3 py-2 rounded text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button className="w-full bg-[#22C55E] text-white py-3 rounded font-medium">
              Buy PEPE
            </button>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-[#22C55E]">0.12%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Max Slippage</span>
                <span>1.00%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span>~$2.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
