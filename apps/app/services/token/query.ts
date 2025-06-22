'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  fetchTokenMetadata, 
  fetchTradingPairs, 
  fetchOHLCVData,
  fetchSolanaPrice,
  calculateTokenStats,
  convertToChartData,
  getJupiterQuote,
  getJupiterSellQuote,
  buildJupiterSwapTransaction,
  TokenMetadata,
  TradingPair,
  OHLCVData,
  ChartData,
  TokenStats,
  SolanaPriceData,
  JupiterQuoteResponse,
  JupiterSwapResponse,
  checkTokenAvailability
} from './api';

// Hook for fetching Solana price
export function useSolanaPrice() {
  return useQuery({
    queryKey: ['solanaPrice'],
    queryFn: fetchSolanaPrice,
    staleTime: 1000 * 60, // 1 minute as requested
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 2,
  });
}

// Hook for fetching token image from URI
export function useTokenImage(uri: string) {
  return useQuery({
    queryKey: ['tokenImage', uri],
    queryFn: async () => {
      if (!uri) return null;
      try {
        const response = await fetch(uri);
        const metadata = await response.json();
        return metadata.image || null;
      } catch (error) {
        console.error('Error fetching token image:', error);
        return null;
      }
    },
    enabled: !!uri,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 1,
  });
}

// Query keys
export const tokenQueryKeys = {
  metadata: (mintAddress: string) => ['token', 'metadata', mintAddress] as const,
  tradingPairs: (mintAddress: string) => ['token', 'tradingPairs', mintAddress] as const,
  ohlcvData: (mintAddress: string, limit: number) => ['token', 'ohlcvData', mintAddress, limit] as const,
};

// Hook for fetching token metadata
export function useTokenMetadata(mintAddress: string) {
  return useQuery({
    queryKey: tokenQueryKeys.metadata(mintAddress),
    queryFn: () => fetchTokenMetadata(mintAddress),
    enabled: !!mintAddress,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

// Hook for fetching trading pairs
export function useTradingPairs(mintAddress: string) {
  return useQuery({
    queryKey: tokenQueryKeys.tradingPairs(mintAddress),
    queryFn: () => fetchTradingPairs(mintAddress),
    enabled: !!mintAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Hook for fetching OHLCV data
export function useOHLCVData(mintAddress: string, limit: number = 240) {
  return useQuery({
    queryKey: tokenQueryKeys.ohlcvData(mintAddress, limit),
    queryFn: () => fetchOHLCVData(mintAddress, limit),
    enabled: !!mintAddress,
    staleTime: 1000 * 15, // 15 seconds to match chart interval
    retry: 2,
  });
}

// Combined hook for token trading data
export function useTokenTradingData(mintAddress: string) {
  const { data: metadata, isLoading: isLoadingMetadata } = useTokenMetadata(mintAddress);
  const { data: tradingPairs, isLoading: isLoadingPairs } = useTradingPairs(mintAddress);
  const { data: ohlcvData, isLoading: isLoadingOHLCV } = useOHLCVData(mintAddress);
  const { data: solanaPrice, isLoading: isLoadingSolana } = useSolanaPrice();

  const stats = calculateTokenStats(ohlcvData || [], metadata || null, solanaPrice?.price || 0);
  const chartData = convertToChartData(ohlcvData || [], solanaPrice?.price || 0);

  return {
    metadata,
    tradingPairs,
    ohlcvData,
    chartData,
    stats,
    solanaPrice,
    isLoading: isLoadingMetadata || isLoadingPairs || isLoadingOHLCV || isLoadingSolana,
    hasData: !!metadata && !!ohlcvData && ohlcvData.length > 0 && !!solanaPrice,
  };
}

// Query for buying tokens with SOL
export const useBuyQuote = (tokenMint: string, solAmount: number, slippageBps: number = 500) => {
  return useQuery({
    queryKey: ['buyQuote', tokenMint, solAmount, slippageBps],
    queryFn: async () => {
      if (solAmount <= 0) return null;
      
      try {
        // Check token availability first
        const isAvailable = await checkTokenAvailability(tokenMint);
        
        const quote = await getJupiterQuote(tokenMint, solAmount, slippageBps);
        
        if (!quote && !isAvailable) {
          throw new Error('Token not available on Jupiter. It might be too new or not have enough liquidity.');
        }
        
        return quote;
      } catch (error) {
        console.error('Buy quote error:', error);
        throw error;
      }
    },
    enabled: !!tokenMint && solAmount > 0,
    staleTime: 15 * 1000, // 15 seconds
    retry: 1, // Only retry once for faster error feedback
  });
};

// Query for selling tokens for SOL  
export const useSellQuote = (tokenMint: string, tokenAmount: number, decimals: number = 9, slippageBps: number = 500) => {
  return useQuery({
    queryKey: ['sellQuote', tokenMint, tokenAmount, decimals, slippageBps],
    queryFn: async () => {
      if (tokenAmount <= 0) return null;
      
      try {
        // Check token availability first
        const isAvailable = await checkTokenAvailability(tokenMint);
        
        // Convert token amount considering decimals
        const amountInBaseUnits = Math.floor(tokenAmount * Math.pow(10, decimals));
        const quote = await getJupiterSellQuote(tokenMint, amountInBaseUnits, slippageBps);
        
        if (!quote && !isAvailable) {
          throw new Error('Token not available on Jupiter. It might be too new or not have enough liquidity.');
        }
        
        return quote;
      } catch (error) {
        console.error('Sell quote error:', error);
        throw error;
      }
    },
    enabled: !!tokenMint && tokenAmount > 0,
    staleTime: 15 * 1000, // 15 seconds
    retry: 1, // Only retry once for faster error feedback
  });
};

// Mutation hook for building and executing swap transactions
export function useJupiterSwap() {
  return useMutation({
    mutationFn: async ({ 
      quote, 
      userPublicKey,
      priorityFee
    }: { 
      quote: JupiterQuoteResponse; 
      userPublicKey: string;
      priorityFee?: number;
    }) => {
      return buildJupiterSwapTransaction(quote, userPublicKey, priorityFee);
    },
  });
} 