'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  fetchTokenMetadata, 
  fetchTradingPairs, 
  fetchOHLCVData,
  fetchSolanaPrice,
  calculateTokenStats,
  convertToChartData,
  TokenMetadata,
  TradingPair,
  OHLCVData,
  ChartData,
  TokenStats,
  SolanaPriceData
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