'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { 
  PulseWebSocketManager, 
  ProcessedToken, 
  TokenMetadata, 
  BitqueryResponse, 
  processTokenData,
  fetchTokenMetadata 
} from './api';

// Query keys
export const pulseQueryKeys = {
  newTokens: ['pulse', 'newTokens'] as const,
  tokenMetadata: (uri: string) => ['pulse', 'tokenMetadata', uri] as const,
};

// Hook for managing WebSocket connection and real-time data
export function useNewTokensWebSocket() {
  const queryClient = useQueryClient();
  const wsManagerRef = useRef<PulseWebSocketManager | null>(null);

  // Query to store the tokens data
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: pulseQueryKeys.newTokens,
    queryFn: () => Promise.resolve([] as ProcessedToken[]),
    staleTime: Infinity, // Data is always fresh from WebSocket
  });

  useEffect(() => {
    // Initialize WebSocket connection
    wsManagerRef.current = new PulseWebSocketManager();
    
    const handleNewData = (data: BitqueryResponse) => {
      if (data.Solana?.TokenSupplyUpdates?.length > 0) {
        const newTokens = data.Solana.TokenSupplyUpdates.map(processTokenData);
        
        // Update the query data by prepending new tokens (most recent first)
        queryClient.setQueryData(pulseQueryKeys.newTokens, (oldTokens: ProcessedToken[] = []) => {
          const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
          const uniqueNewTokens = newTokens.filter(token => !existingMintAddresses.has(token.mintAddress));
          
          // Keep only the last 100 tokens to prevent memory issues
          return [...uniqueNewTokens, ...oldTokens].slice(0, 100);
        });
      }
    };

    wsManagerRef.current.connect(handleNewData);

    // Cleanup on unmount
    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, [queryClient]);

  return {
    tokens,
    isLoading,
    isConnected: wsManagerRef.current !== null,
  };
}

// Hook for fetching token metadata
export function useTokenMetadata(uri: string, enabled = true) {
  return useQuery({
    queryKey: pulseQueryKeys.tokenMetadata(uri),
    queryFn: () => fetchTokenMetadata(uri),
    enabled: enabled && !!uri,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
  });
}

// Hook for getting enhanced token data with metadata
export function useEnhancedToken(token: ProcessedToken) {
  const { data: metadata, isLoading: isLoadingMetadata } = useTokenMetadata(token.uri);
  
  return {
    ...token,
    metadata,
    isLoadingMetadata,
    // Update icon with metadata image if available
    icon: metadata?.image ? '🖼️' : token.icon,
    // Update name with metadata name if available
    name: metadata?.name || token.name,
    // Update symbol with metadata symbol if available  
    symbol: metadata?.symbol || token.symbol,
  };
}
