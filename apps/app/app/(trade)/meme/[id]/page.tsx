'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { 
  Copy, 
  ExternalLink, 
  Share2, 
  Star,
  X,
  Loader2
} from 'lucide-react';
import { 
  useTokenTradingData, 
  useTokenImage, 
  useBuyQuote, 
  useSellQuote, 
  useJupiterSwap 
} from '@/services/token/query';
import { formatPrice, formatNumber, formatMarketCap } from '@/services/token/api';

export default function TradingPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('0.00');
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [showSlippagePopup, setShowSlippagePopup] = useState(false);
  const [maxSlippage, setMaxSlippage] = useState('5');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Wallet integration
  const { publicKey, sendTransaction, connected, connecting } = useWallet();
  const { connection } = useConnection();

  // Fetch token data
  const { metadata, chartData, stats, isLoading, hasData } = useTokenTradingData(tokenId);
  const { data: tokenImage, isLoading: isLoadingImage } = useTokenImage(metadata?.uri || '');

  // Parse amount and slippage for quotes
  const amountNum = parseFloat(amount) || 0;
  const slippageBps = Math.floor(parseFloat(maxSlippage) * 100); // Convert % to basis points

  // Jupiter quotes - Always try to get quotes when amount > 0 and we have token data
  const buyQuoteEnabled = selectedTab === 'buy' && amountNum > 0;
  const sellQuoteEnabled = selectedTab === 'sell' && amountNum > 0;

  const { data: buyQuote, isLoading: isBuyQuoteLoading, error: buyQuoteError } = useBuyQuote(
    tokenId,
    amountNum,
    slippageBps
  );

  const { data: sellQuote, isLoading: isSellQuoteLoading, error: sellQuoteError } = useSellQuote(
    tokenId,
    amountNum, // Amount in token units
    metadata?.decimals || 9,
    slippageBps
  );

  const jupiterSwap = useJupiterSwap();

  // Debug logs
  console.log('Trading page state:', {
    tokenId,
    amountNum,
    slippageBps,
    buyQuoteEnabled,
    sellQuoteEnabled,
    buyQuote,
    sellQuote,
    buyQuoteError,
    sellQuoteError,
    connected
  });

  const handleTabChange = (tab: 'buy' | 'sell') => {
    setSelectedTab(tab);
    setAmount('0.00');
    setSwapError(null);
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
    setSwapError(null);
  };

  const handleSwap = async () => {
    if (!connected || !publicKey) {
      setSwapError('Please connect your wallet first');
      return;
    }

    // Validate minimum amounts
    if (selectedTab === 'buy' && amountNum < 0.001) {
      setSwapError('Minimum buy amount is 0.001 SOL');
      return;
    }

    if (selectedTab === 'sell' && amountNum <= 0) {
      setSwapError('Please enter a valid sell amount');
      return;
    }

    const quote = selectedTab === 'buy' ? buyQuote : sellQuote;
    if (!quote) {
      setSwapError('No quote available. Please check the amount and try again.');
      return;
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      console.log('Starting swap with quote:', quote);

      // Build the swap transaction
      const swapResponse = await jupiterSwap.mutateAsync({
        quote,
        userPublicKey: publicKey.toString(),
        priorityFee: 100000, // 0.0001 SOL priority fee
      });

      if (!swapResponse || !swapResponse.swapTransaction) {
        throw new Error('Failed to build swap transaction');
      }

      console.log('Swap transaction built successfully:', swapResponse);

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      console.log('Requesting wallet signature...');

      // Sign and send transaction - this will prompt user for approval
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('Swap transaction sent:', signature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }
      
      // Reset form on success
      setAmount('0.00');
      setSwapError(null);
      
      // Show success message
      alert(`Swap successful! Transaction: ${signature}`);

    } catch (error) {
      console.error('Swap failed:', error);
      
      let errorMessage = 'Swap failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Missing token program') || error.message.includes('Token not found')) {
          errorMessage = 'This token is not yet available for trading on Jupiter. It might be too new or not have enough liquidity.';
        } else if (error.message.includes('No route found')) {
          errorMessage = 'No trading route available for this token. Try again later or with different parameters.';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance to complete this trade.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSwapError(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  // Calculate expected output for display
  const expectedOutput = selectedTab === 'buy' 
    ? buyQuote ? (parseInt(buyQuote.outAmount) / Math.pow(10, metadata?.decimals || 9)).toFixed(6) : '0'
    : sellQuote ? (parseInt(sellQuote.outAmount) / 1e9).toFixed(6) : '0';

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
              {/* Wallet Connection */}
              {!connected && (
                <div className="mb-4">
                  <WalletMultiButton className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium py-3 px-4 rounded transition-colors" />
                </div>
              )}

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
                  className="bg-[#1F2937] text-gray-400 py-2 px-4 rounded text-sm hover:bg-[#374151]"
                >
                  set max slippage ({maxSlippage}%)
                </button>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1F2937] text-white py-3 px-4 rounded focus:ring-2 focus:ring-[#22C55E] focus:outline-none"
                  placeholder="0.00"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-white">{selectedTab === 'buy' ? 'Sol' : metadata?.symbol || 'TOKEN'}</span>
                </div>
              </div>

              {/* Quote Display */}
              {connected && amountNum > 0 && (
                <div className="bg-[#1F2937] p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">You'll receive:</span>
                    {(isBuyQuoteLoading || isSellQuoteLoading) && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  <div className="text-white font-medium">
                    {expectedOutput} {selectedTab === 'buy' ? metadata?.symbol || 'TOKEN' : 'SOL'}
                  </div>
                  {(buyQuote || sellQuote) && (
                    <div className="text-gray-400 text-xs mt-1">
                      Price Impact: {parseFloat((buyQuote || sellQuote)?.priceImpactPct || '0').toFixed(2)}%
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {swapError && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded text-sm">
                  {swapError}
                </div>
              )}

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
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => handleQuickAmountClick('25%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    25%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('50%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    50%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('75%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    75%
                  </button>
                  <button 
                    onClick={() => handleQuickAmountClick('100%')}
                    className="bg-[#1F2937] text-gray-400 py-2 rounded text-sm hover:bg-[#374151]"
                  >
                    100%
                  </button>
                </div>
              )}

              {/* Swap Button */}
              <button 
                onClick={handleSwap}
                disabled={!connected || amountNum <= 0 || isSwapping || (!buyQuote && !sellQuote)}
                className={`w-full py-3 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedTab === 'buy'
                    ? 'bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-600'
                    : 'bg-[#F87171] hover:bg-[#EF4444] disabled:bg-gray-600'
                } text-white disabled:text-gray-400 disabled:cursor-not-allowed`}
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {selectedTab === 'buy' ? 'Buying...' : 'Selling...'}
                  </>
                ) : (
                  selectedTab === 'buy' ? 'buy' : 'sell'
                )}
              </button>

              {/* Jupiter Powered By */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-4">
                <span>Powered by</span>
                <img src="/poweredbyjupiter-dark.svg" alt="Jupiter" className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slippage Settings Popup */}
      {showSlippagePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1F2B] p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Set Max Slippage</h3>
              <button
                onClick={() => setShowSlippagePopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['1', '3', '5'].map((value) => (
                  <button
                    key={value}
                    onClick={() => setMaxSlippage(value)}
                    className={`py-2 px-3 rounded text-sm transition-colors ${
                      maxSlippage === value
                        ? 'bg-[#22C55E] text-white'
                        : 'bg-[#1F2937] text-gray-400 hover:bg-[#374151]'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={maxSlippage}
                  onChange={(e) => setMaxSlippage(e.target.value)}
                  className="w-full bg-[#1F2937] text-white py-2 px-3 pr-8 rounded focus:ring-2 focus:ring-[#22C55E] focus:outline-none"
                  placeholder="Custom"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              
              <div className="text-gray-400 text-xs">
                Higher slippage tolerance may result in less favorable prices but higher chance of transaction success.
              </div>
              
              <button
                onClick={() => setShowSlippagePopup(false)}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-2 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

