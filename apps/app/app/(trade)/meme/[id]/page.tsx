'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';
import { 
  Copy, 
  ExternalLink, 
  Share2, 
  Star,
  X
} from 'lucide-react';
import { useTokenTradingData, useTokenImage } from '@/services/token/query';
import { formatPrice, formatNumber, formatMarketCap } from '@/services/token/api';

export default function TradingPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('0.00');
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [showSlippagePopup, setShowSlippagePopup] = useState(false);
  const [maxSlippage, setMaxSlippage] = useState('2');

  // Fetch token data
  const { metadata, chartData, stats, isLoading, hasData } = useTokenTradingData(tokenId);
  const { data: tokenImage, isLoading: isLoadingImage } = useTokenImage(metadata?.uri || '');

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
    if (!chartContainerRef.current || !hasData || !chartData || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0A0A' },
        textColor: '#9CA3AF',
        fontSize: 12,
      },
      grid: {
        vertLines: { 
          color: '#1F2937',
          style: LineStyle.Solid,
          visible: true,
        },
        horzLines: { 
          color: '#1F2937',
          style: LineStyle.Solid,
          visible: true,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#6B7280',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: '#6B7280',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        autoScale: true,
        alignLabels: true,
        ticksVisible: true,
        entireTextOnly: false,
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        minBarSpacing: 2,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        mouse: true,
        touch: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: true,
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      wickVisible: true,
      priceFormat: {
        type: 'custom',
        minMove: 1,
        formatter: (price: number) => formatMarketCap(price),
      },
    });

    // Set the chart data
    candlestickSeries.setData(chartData as any);
    
    // Fit content with some padding
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [hasData, chartData]);

  return (
    <div className="h-[calc(100vh-52px)] bg-black">
      <div className="flex flex-col h-full">
        {/* Token Metadata Line */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#111827] border-b border-[#1F2937]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLoadingImage ? (
                <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
              ) : tokenImage ? (
                <img 
                  src={tokenImage} 
                  alt="Token" 
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className='w-6 h-6 bg-gray-600 rounded animate-pulse'></div>
              )}
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <span className="text-white font-medium">{metadata?.symbol || 'TOKEN'}</span>
                  <span className="text-gray-400">{metadata?.name ? `${metadata.name.slice(0, 10)}...` : 'Loading...'}</span>
                </>
              )}
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-4 text-sm">
              {isLoading ? (
                <div className="flex gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className="text-gray-400">Price: <span className="text-white">{formatPrice(stats.price)}</span></span>
                  <span className="text-gray-400">Liquidity: <span className="text-white">{formatNumber(stats.liquidity)} SOL</span></span>
                  <span className="text-gray-400">Supply: <span className="text-white">{formatNumber(stats.supply)}</span></span>
                  <span className="text-gray-400">Global Fees Paid: <span className="text-white">{stats.globalFeesPaid.toFixed(3)}</span></span>
                  <span className="text-gray-400">B.Curve: <span className="text-green-400">{stats.bondingCurveProgress.toFixed(2)}%</span></span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
            <Share2 className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Copy 
              className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" 
              onClick={() => navigator.clipboard.writeText(tokenId)}
            />
            <ExternalLink 
              className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => window.open(`https://solscan.io/token/${tokenId}`, '_blank')}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chart */}
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <div className="text-white text-sm">Loading chart data...</div>
                </div>
              </div>
            ) : !hasData ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-lg mb-2">📊</div>
                  <div>No trading data available</div>
                  <div className="text-sm">Token may be too new or not actively traded</div>
                </div>
              </div>
            ) : (
              <div ref={chartContainerRef} className="w-full h-full" />
            )}
          </div>

          {/* Trading Panel */}
          <div className="w-80 bg-[#1A1F2B] h-full overflow-y-auto">
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
                {`${selectedTab}`}
              </button>
              <img src="/poweredbyjupiter-dark.svg" alt="SOL" className="w-full h-10" />
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
