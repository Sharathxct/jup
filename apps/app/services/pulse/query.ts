'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { 
  PulseWebSocketManager, 
  ProcessedToken, 
  TokenMetadata, 
  BitqueryResponse, 
  processTokenData,
  processFinalStretchData,
  processMigratedData,
  processInitialMigratedData,
  fetchTokenMetadata,
  fetchInitialNewTokens,
  fetchInitialFinalStretchTokens,
  fetchInitialMigratedTokens
} from './api';

// Query keys
export const pulseQueryKeys = {
  newTokens: ['pulse', 'newTokens'] as const,
  finalStretchTokens: ['pulse', 'finalStretchTokens'] as const,
  migratedTokens: ['pulse', 'migratedTokens'] as const,
  tokenMetadata: (uri: string) => ['pulse', 'tokenMetadata', uri] as const,
};

// LocalStorage keys for data persistence
const STORAGE_KEYS = {
  newTokens: 'pulse_new_tokens',
  finalStretchTokens: 'pulse_final_stretch_tokens',
  migratedTokens: 'pulse_migrated_tokens',
  lastUpdated: 'pulse_last_updated',
};

// Helper functions for localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.lastUpdated, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
}

function isDataStale(): boolean {
  const lastUpdated = localStorage.getItem(STORAGE_KEYS.lastUpdated);
  if (!lastUpdated) return true;
  
  const age = Date.now() - parseInt(lastUpdated);
  const maxAge = 30 * 60 * 1000; // 30 minutes
  return age > maxAge;
}

// Helper function to remove duplicates from token arrays
function deduplicateTokens(tokens: ProcessedToken[]): ProcessedToken[] {
  const seen = new Set<string>();
  return tokens.filter(token => {
    if (seen.has(token.mintAddress)) {
      console.log(`Removing duplicate token: ${token.name} (${token.mintAddress})`);
      return false;
    }
    seen.add(token.mintAddress);
    return true;
  });
}

// Function to clear all cached pulse data
export function clearPulseCache(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Pulse cache cleared');
  } catch (error) {
    console.warn('Failed to clear pulse cache:', error);
  }
}

// Hook for managing WebSocket connection and real-time data
export function usePulseWebSocket() {
  const queryClient = useQueryClient();
  const wsManagerRef = useRef<PulseWebSocketManager | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  // Load initial data from localStorage if available and not stale
  const getInitialData = (storageKey: string): ProcessedToken[] => {
    if (typeof window === 'undefined') return [];
    if (isDataStale()) return [];
    const cachedData = loadFromStorage<ProcessedToken[]>(storageKey) || [];
    return deduplicateTokens(cachedData); // Remove any duplicates from cached data
  };

  // Queries to store the different token types with localStorage persistence
  const { data: newTokens = [], isLoading: isLoadingNew } = useQuery({
    queryKey: pulseQueryKeys.newTokens,
    queryFn: () => Promise.resolve(getInitialData(STORAGE_KEYS.newTokens)),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: finalStretchTokens = [], isLoading: isLoadingFinal } = useQuery({
    queryKey: pulseQueryKeys.finalStretchTokens,
    queryFn: () => Promise.resolve(getInitialData(STORAGE_KEYS.finalStretchTokens)),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: migratedTokens = [], isLoading: isLoadingMigrated } = useQuery({
    queryKey: pulseQueryKeys.migratedTokens,
    queryFn: () => Promise.resolve(getInitialData(STORAGE_KEYS.migratedTokens)),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  useEffect(() => {
    // Use singleton instance to prevent multiple connections
    wsManagerRef.current = PulseWebSocketManager.getInstance();
    
    // Fetch initial data for all three categories
    const fetchInitialData = async () => {
      try {
        // Check if we have valid cached data
        const hasCachedData = !isDataStale() && (
          loadFromStorage<ProcessedToken[]>(STORAGE_KEYS.newTokens)?.length ||
          loadFromStorage<ProcessedToken[]>(STORAGE_KEYS.finalStretchTokens)?.length ||
          loadFromStorage<ProcessedToken[]>(STORAGE_KEYS.migratedTokens)?.length
        );

        // If we have cached data, don't show loading spinner
        if (hasCachedData) {
          console.log('Using cached token data');
          setIsLoadingInitialData(false);
          return;
        }

        setIsLoadingInitialData(true);
        console.log('Fetching fresh token data...');
        
        // Fetch all initial data in parallel
        const [rawNewTokens, rawFinalStretchTokens, rawMigratedTokens] = await Promise.all([
          fetchInitialNewTokens(),
          fetchInitialFinalStretchTokens(),
          fetchInitialMigratedTokens()
        ]);

        // Deduplicate initial data to ensure no duplicates
        const initialNewTokens = deduplicateTokens(rawNewTokens);
        const initialFinalStretchTokens = deduplicateTokens(rawFinalStretchTokens);
        const initialMigratedTokens = deduplicateTokens(rawMigratedTokens);

        // Set initial data in query cache and save to localStorage
        queryClient.setQueryData(pulseQueryKeys.newTokens, initialNewTokens);
        queryClient.setQueryData(pulseQueryKeys.finalStretchTokens, initialFinalStretchTokens);
        queryClient.setQueryData(pulseQueryKeys.migratedTokens, initialMigratedTokens);
        
        // Save to localStorage for persistence
        saveToStorage(STORAGE_KEYS.newTokens, initialNewTokens);
        saveToStorage(STORAGE_KEYS.finalStretchTokens, initialFinalStretchTokens);
        saveToStorage(STORAGE_KEYS.migratedTokens, initialMigratedTokens);

        console.log(`Loaded fresh data: ${initialNewTokens.length} new tokens, ${initialFinalStretchTokens.length} final stretch tokens, ${initialMigratedTokens.length} migrated tokens`);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    // Fetch initial data immediately
    fetchInitialData();
    
    const handleNewData = (data: BitqueryResponse) => {
      // Handle new tokens
      if (data.Solana?.TokenSupplyUpdates?.length > 0) {
        const newTokensData = data.Solana.TokenSupplyUpdates.map(processTokenData);
        
        queryClient.setQueryData(pulseQueryKeys.newTokens, (oldTokens: ProcessedToken[] = []) => {
          // Create a comprehensive set of existing mint addresses 
          const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
          
          // Filter out duplicates and ensure uniqueness
          const uniqueNewTokens = newTokensData.filter(token => {
            if (existingMintAddresses.has(token.mintAddress)) {
              console.log(`Duplicate token filtered: ${token.name} (${token.mintAddress})`);
              return false;
            }
            existingMintAddresses.add(token.mintAddress); // Prevent duplicates within the new batch
            return true;
          });
          
          if (uniqueNewTokens.length > 0) {
            console.log(`Adding ${uniqueNewTokens.length} new tokens to New Pairs`);
          }
          
          // Add new tokens to the beginning (most recent first)
          const updatedTokens = [...uniqueNewTokens, ...oldTokens].slice(0, 100);
          
          // Save to localStorage for persistence
          saveToStorage(STORAGE_KEYS.newTokens, updatedTokens);
          
          return updatedTokens;
        });
      }

      // Handle final stretch tokens
      if (data.Solana?.DEXPools && data.Solana.DEXPools.length > 0) {
        const finalStretchData = data.Solana.DEXPools
          .map(processFinalStretchData)
          .filter((token): token is ProcessedToken => token !== null); // Filter out non-pump tokens
        
        if (finalStretchData.length > 0) {
          queryClient.setQueryData(pulseQueryKeys.finalStretchTokens, (oldTokens: ProcessedToken[] = []) => {
            // Create a comprehensive set of existing mint addresses 
            const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
            
            // Filter out duplicates and ensure uniqueness
            const uniqueNewTokens = finalStretchData.filter(token => {
              if (existingMintAddresses.has(token.mintAddress)) {
                console.log(`Duplicate token filtered: ${token.name} (${token.mintAddress})`);
                return false;
              }
              existingMintAddresses.add(token.mintAddress); // Prevent duplicates within the new batch
              return true;
            });
            
            if (uniqueNewTokens.length > 0) {
              console.log(`Adding ${uniqueNewTokens.length} new tokens to Final Stretch`);
            }
            
            // Add new tokens to the beginning (most recent first)
            const updatedTokens = [...uniqueNewTokens, ...oldTokens].slice(0, 100);
            
            // Save to localStorage for persistence
            saveToStorage(STORAGE_KEYS.finalStretchTokens, updatedTokens);
            
            return updatedTokens;
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
            // Create a comprehensive set of existing mint addresses 
            const existingMintAddresses = new Set(oldTokens.map(token => token.mintAddress));
            
            // Filter out duplicates and ensure uniqueness
            const uniqueNewTokens = migratedData.filter(token => {
              if (existingMintAddresses.has(token.mintAddress)) {
                console.log(`Duplicate token filtered: ${token.name} (${token.mintAddress})`);
                return false;
              }
              existingMintAddresses.add(token.mintAddress); // Prevent duplicates within the new batch
              return true;
            });
            
            if (uniqueNewTokens.length > 0) {
              console.log(`Adding ${uniqueNewTokens.length} new tokens to Migrated`);
            }
            
            // Add new tokens to the beginning (most recent first)
            const updatedTokens = [...uniqueNewTokens, ...oldTokens].slice(0, 100);
            
            // Save to localStorage for persistence
            saveToStorage(STORAGE_KEYS.migratedTokens, updatedTokens);
            
            return updatedTokens;
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
    isLoadingInitialData,
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
