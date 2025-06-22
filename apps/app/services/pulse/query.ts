'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { 
  PulseWebSocketManager, 
  ProcessedToken, 
  TokenMetadata, 
  BitqueryResponse, 
  processTokenData,
  processFinalStretchData,
  processMigratedData,
  fetchTokenMetadata 
} from './api';

// Query keys
export const pulseQueryKeys = {
  newTokens: ['pulse', 'newTokens'] as const,
  finalStretchTokens: ['pulse', 'finalStretchTokens'] as const,
  migratedTokens: ['pulse', 'migratedTokens'] as const,
  tokenMetadata: (uri: string) => ['pulse', 'tokenMetadata', uri] as const,
};

// Hook for managing WebSocket connection and real-time data
export function usePulseWebSocket() {
  const queryClient = useQueryClient();
  const wsManagerRef = useRef<PulseWebSocketManager | null>(null);

  // Queries to store the different token types
  const { data: newTokens = [], isLoading: isLoadingNew } = useQuery({
    queryKey: pulseQueryKeys.newTokens,
    queryFn: () => Promise.resolve([] as ProcessedToken[]),
    staleTime: Infinity,
  });

  const { data: finalStretchTokens = [], isLoading: isLoadingFinal } = useQuery({
    queryKey: pulseQueryKeys.finalStretchTokens,
    queryFn: () => Promise.resolve([] as ProcessedToken[]),
    staleTime: Infinity,
  });

  const { data: migratedTokens = [], isLoading: isLoadingMigrated } = useQuery({
    queryKey: pulseQueryKeys.migratedTokens,
    queryFn: () => Promise.resolve([] as ProcessedToken[]),
    staleTime: Infinity,
  });

  useEffect(() => {
    // Use singleton instance to prevent multiple connections
    wsManagerRef.current = PulseWebSocketManager.getInstance();
    
    const handleNewData = (data: BitqueryResponse) => {
      // Handle new tokens
      if (data.Solana?.TokenSupplyUpdates?.length > 0) {
        const newTokensData = data.Solana.TokenSupplyUpdates.map(processTokenData);
        
        queryClient.setQueryData(pulseQueryKeys.newTokens, (oldTokens: ProcessedToken[] = []) => {
          const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
          const uniqueNewTokens = newTokensData.filter(token => !existingMintAddresses.has(token.mintAddress));
          
          return [...uniqueNewTokens, ...oldTokens].slice(0, 100);
        });
      }

      // Handle final stretch tokens
      if (data.Solana?.DEXPools && data.Solana.DEXPools.length > 0) {
        const finalStretchData = data.Solana.DEXPools
          .map(processFinalStretchData)
          .filter((token): token is ProcessedToken => token !== null); // Filter out non-pump tokens
        
        if (finalStretchData.length > 0) {
          queryClient.setQueryData(pulseQueryKeys.finalStretchTokens, (oldTokens: ProcessedToken[] = []) => {
            const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
            const uniqueNewTokens = finalStretchData.filter(token => !existingMintAddresses.has(token.mintAddress));
            
            return [...uniqueNewTokens, ...oldTokens].slice(0, 100);
          });
        }
      }

      // Handle migrated tokens
      if (data.Solana?.Instructions && data.Solana.Instructions.length > 0) {
        const migratedData = data.Solana.Instructions
          .map(processMigratedData)
          .filter((token): token is ProcessedToken => token !== null); // Filter out non-pump tokens
        
        if (migratedData.length > 0) {
          queryClient.setQueryData(pulseQueryKeys.migratedTokens, (oldTokens: ProcessedToken[] = []) => {
            const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
            const uniqueNewTokens = migratedData.filter(token => !existingMintAddresses.has(token.mintAddress));
            
            return [...uniqueNewTokens, ...oldTokens].slice(0, 100);
          });
        }
      }
    };

    wsManagerRef.current.connect(handleNewData);

    // Cleanup on unmount
    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, [queryClient]);

  return {
    newTokens,
    finalStretchTokens,
    migratedTokens,
    isLoading: isLoadingNew || isLoadingFinal || isLoadingMigrated,
    isConnected: wsManagerRef.current !== null,
  };
}

// Backward compatibility hook
export function useNewTokensWebSocket() {
  const { newTokens, isLoading, isConnected } = usePulseWebSocket();
  return {
    tokens: newTokens,
    isLoading,
    isConnected,
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
