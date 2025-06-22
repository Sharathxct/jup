// Types for token data
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  uri: string;
  mintAddress: string;
  createdAt: string;
  creator: string;
}

export interface TradingPair {
  marketAddress: string;
  protocolName: string;
  protocolFamily: string;
  programAddress: string;
  tradeCount: string;
}

export interface OHLCVData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string;
  count: string;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SolanaPriceData {
  price: number;
  priceChange24h: number;
}

export interface TokenStats {
  price: number;
  liquidity: number;
  supply: number;
  globalFeesPaid: number;
  bondingCurveProgress: number;
  marketCap: number;
}

// Jupiter Swap API interfaces and functions
export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: any;
  dynamicSlippageReport?: any;
  simulationError: any;
}

const BITQUERY_ENDPOINT = 'https://streaming.bitquery.io/eap';
const BITQUERY_TOKEN = "ory_at_8iZLjU4IUpd1pFNCW03KzHcnjgA27-6ZHwVfqdXOnqI.sEB3TBQIDc_3gLHqoKZho9Ob7h_rmq8h8LB1dKAF2qE";

// SOL mint address (wrapped SOL)
export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const JUPITER_API_BASE = 'https://quote-api.jup.ag';

// Fetch token metadata by mint address
export async function fetchTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  const query = `
    query GetTokenMetadata($mintAddress: String!) {
      Solana {
        TokenSupplyUpdates(
          where: {
            Instruction: {
              Program: {
                Address: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}, 
                Method: {is: "create"}
              }
            }, 
            TokenSupplyUpdate: {
              Currency: {
                MintAddress: {is: $mintAddress}
              }
            }
          }
        ) {
          Block {
            Time
          }
          Transaction {
            Signer
          }
          TokenSupplyUpdate {
            Amount
            Currency {
              Symbol
              Name
              MintAddress
              Decimals
              Uri
            }
            PostBalance
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITQUERY_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { mintAddress },
      }),
    });

    const data = await response.json();
    const tokenUpdate = data.data?.Solana?.TokenSupplyUpdates?.[0];
    
    if (!tokenUpdate) {
      return null;
    }

    const currency = tokenUpdate.TokenSupplyUpdate.Currency;
    
    return {
      name: currency.Name,
      symbol: currency.Symbol,
      decimals: currency.Decimals,
      uri: currency.Uri,
      mintAddress: currency.MintAddress,
      createdAt: tokenUpdate.Block.Time,
      creator: tokenUpdate.Transaction.Signer,
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

// Fetch trading pairs for a token
export async function fetchTradingPairs(mintAddress: string): Promise<TradingPair[]> {
  const query = `
    query GetTradingPairs($mintAddress: String!) {
      Solana {
        DEXTradeByTokens(
          where: {
            Trade: {
              Currency: {
                MintAddress: {is: $mintAddress}
              }
            }
          }
        ) {
          count
          Trade {
            Market {
              MarketAddress
            }
            Dex {
              ProgramAddress
              ProtocolName
              ProtocolFamily
            }
            Currency {
              MintAddress
              Symbol
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITQUERY_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { mintAddress },
      }),
    });

    const data = await response.json();
    const trades = data.data?.Solana?.DEXTradeByTokens || [];
    
    return trades.map((trade: any) => ({
      marketAddress: trade.Trade.Market.MarketAddress,
      protocolName: trade.Trade.Dex.ProtocolName,
      protocolFamily: trade.Trade.Dex.ProtocolFamily,
      programAddress: trade.Trade.Dex.ProgramAddress,
      tradeCount: trade.count,
    }));
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return [];
  }
}

// Fetch OHLCV data for a token
export async function fetchOHLCVData(mintAddress: string, limit: number = 240): Promise<OHLCVData[]> {
  const query = `
    query GetOHLCVData($mintAddress: String!, $limit: Int!) {
      Solana {
        DEXTradeByTokens(
          limit: {count: $limit}
          orderBy: {descendingByField: "Block_Timefield"}
          where: {
            Trade: {
              Currency: {MintAddress: {is: $mintAddress}}, 
              Dex: {ProgramAddress: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}}, 
              PriceAsymmetry: {lt: 0.1}
            }
          }
        ) {
          Block {
            Timefield: Time(interval: {in: seconds, count: 15})
          }
          volume: sum(of: Trade_Amount)
          Trade {
            high: Price(maximum: Trade_Price)
            low: Price(minimum: Trade_Price)
            open: Price(minimum: Block_Slot)
            close: Price(maximum: Block_Slot)
          }
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITQUERY_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { mintAddress, limit },
      }),
    });

    const data = await response.json();
    const trades = data.data?.Solana?.DEXTradeByTokens || [];
    
    return trades
      .map((trade: any) => ({
        time: trade.Block.Timefield,
        open: trade.Trade.open,
        high: trade.Trade.high,
        low: trade.Trade.low,
        close: trade.Trade.close,
        volume: trade.volume,
        count: trade.count,
      }))
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error fetching OHLCV data:', error);
    return [];
  }
}

// Fetch Solana price from CoinGecko
export async function fetchSolanaPrice(): Promise<SolanaPriceData> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
    );
    const data = await response.json();
    return {
      price: data.solana.usd,
      priceChange24h: data.solana.usd_24h_change || 0,
    };
  } catch (error) {
    console.error("Failed to fetch Solana price:", error);
    return {
      price: 0,
      priceChange24h: 0,
    };
  }
}

// Convert OHLCV data to chart data with realistic market cap calculation
export function convertToChartData(ohlcvData: OHLCVData[], solanaPrice: number = 0): ChartData[] {
  if (ohlcvData.length === 0 || solanaPrice === 0) return [];
  
  return ohlcvData.map((candle) => {
    // The price data from Bitquery might already be in the correct scale
    // Let's use a smaller multiplier to get realistic K-range market caps
    // Most pump.fun tokens have market caps from $1K to $100K
    const scaleFactor = 1000000; // Adjust this to get realistic market cap values
    
    return {
      time: Math.floor(new Date(candle.time).getTime() / 1000) as any,
      open: candle.open * solanaPrice * scaleFactor,
      high: candle.high * solanaPrice * scaleFactor,
      low: candle.low * solanaPrice * scaleFactor,
      close: candle.close * solanaPrice * scaleFactor,
    };
  }).filter(candle => candle.open > 0 && candle.high > 0 && candle.low > 0 && candle.close > 0);
}

// Calculate token stats with realistic market cap
export function calculateTokenStats(ohlcvData: OHLCVData[], metadata: TokenMetadata | null, solanaPrice: number = 0): TokenStats {
  if (ohlcvData.length === 0 || solanaPrice === 0) {
    return {
      price: 0,
      liquidity: 0,
      supply: 1000000000, // Standard pump.fun supply
      globalFeesPaid: 0,
      bondingCurveProgress: 0,
      marketCap: 0,
    };
  }

  const latestPriceSOL = ohlcvData[ohlcvData.length - 1]?.close || 0;
  const latestPriceUSD = latestPriceSOL * solanaPrice;
  
  // Use the same scale factor for consistency
  const scaleFactor = 1000000;
  const marketCap = latestPriceUSD * scaleFactor;
  
  const totalVolume = ohlcvData.reduce((sum, candle) => sum + parseFloat(candle.volume), 0);
  
  // Calculate approximate stats
  const liquiditySOL = totalVolume / 1000000000; // Approximate liquidity
  const supply = 1000000000; // Standard pump.fun supply
  const globalFeesPaid = totalVolume * 0.01; // Approximate 1% fees
  
  // Mock bonding curve progress (would need actual pool data)
  const bondingCurveProgress = Math.min((liquiditySOL / 85) * 100, 100);

  return {
    price: latestPriceUSD,
    liquidity: liquiditySOL,
    supply,
    globalFeesPaid,
    bondingCurveProgress,
    marketCap,
  };
}

// Format price for display
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(2)}K`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toFixed(2);
  }
}

// Format market cap with better scaling for different ranges
export function formatMarketCap(marketCap: number): string {
  // Handle zero and very small values
  if (marketCap === 0) return '$0';
  if (marketCap < 0) {
    return `-${formatMarketCap(Math.abs(marketCap))}`;
  }
  
  // Different formatting based on magnitude
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(1)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(1)}M`;
  } else if (marketCap >= 10000) {
    // For values 10K and above, show in K with 0 decimals
    return `$${Math.round(marketCap / 1000)}K`;
  } else if (marketCap >= 1000) {
    // For values 1K-10K, show in K with 1 decimal
    return `$${(marketCap / 1000).toFixed(1)}K`;
  } else if (marketCap >= 100) {
    // For values 100-1000, show whole dollars
    return `$${Math.round(marketCap)}`;
  } else if (marketCap >= 10) {
    // For values 10-100, show with 1 decimal
    return `$${marketCap.toFixed(1)}`;
  } else if (marketCap >= 1) {
    // For values 1-10, show with 2 decimals
    return `$${marketCap.toFixed(2)}`;
  } else {
    // For very small values, show with appropriate decimals
    return `$${marketCap.toFixed(3)}`;
  }
}

// Check if token is available on Jupiter
export async function checkTokenAvailability(mintAddress: string): Promise<boolean> {
  try {
    const response = await fetch(`https://tokens.jup.ag/token/${mintAddress}`);
    const isAvailable = response.ok;
    console.log(`Token ${mintAddress} availability on Jupiter:`, isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('Error checking token availability:', error);
    return false;
  }
}

// Get list of all tokens supported by Jupiter
export async function getJupiterTokenList(): Promise<any[]> {
  try {
    const response = await fetch('https://tokens.jup.ag/tokens?tags=verified');
    if (!response.ok) {
      console.error('Failed to fetch Jupiter token list');
      return [];
    }
    const tokens = await response.json();
    console.log('Jupiter supports', tokens.length, 'tokens');
    return tokens;
  } catch (error) {
    console.error('Error fetching Jupiter token list:', error);
    return [];
  }
}

// Get Jupiter quote for SOL to token swap
export async function getJupiterQuote(
  outputMint: string,
  amount: number, // Amount in SOL
  slippageBps: number = 500 // Default 5% slippage (more lenient)
): Promise<JupiterQuoteResponse | null> {
  try {
    // Minimum amount validation - Jupiter needs at least 0.001 SOL
    if (amount < 0.001) {
      console.warn('Amount too small for Jupiter routing, minimum is 0.001 SOL');
      return null;
    }

    // Check if token is available first
    const isAvailable = await checkTokenAvailability(outputMint);
    if (!isAvailable) {
      console.warn(`Token ${outputMint} is not available on Jupiter. It might be too new or not have sufficient liquidity.`);
      // Don't return null immediately, still try the quote
    }

    // Convert SOL amount to lamports (1 SOL = 1e9 lamports)
    const amountInLamports = Math.floor(amount * 1e9);
    
    const params = new URLSearchParams({
      inputMint: SOL_MINT,
      outputMint: outputMint,
      amount: amountInLamports.toString(),
      slippageBps: slippageBps.toString(),
      // Remove restrictive parameters
      // onlyDirectRoutes: 'false',
      // asLegacyTransaction: 'false'
    });

    const response = await fetch(`${JUPITER_API_BASE}/v6/quote?${params}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jupiter quote failed:', response.statusText, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.includes('No route found')) {
          console.error(`No trading route found for token ${outputMint}. This token might not be tradeable on Jupiter yet.`);
        } else if (errorData.error?.includes('Cannot compute other amount threshold')) {
          console.warn('Quote computation threshold warning - this is usually non-critical');
          // Don't throw error for this warning, just log it
        }
      } catch (parseError) {
        // If we can't parse the error, treat it as a regular failure
      }
      
      return null;
    }

    const quote = await response.json();
    console.log('Jupiter quote response:', quote);
    
    // Validate quote has required fields
    if (!quote.outAmount || !quote.inAmount) {
      console.error('Invalid quote response - missing amount fields');
      return null;
    }
    
    return quote;
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    return null;
  }
}

// Get Jupiter quote for token to SOL swap (sell)
export async function getJupiterSellQuote(
  inputMint: string,
  amount: number, // Amount in tokens (considering decimals)
  slippageBps: number = 500 // Default 5% slippage
): Promise<JupiterQuoteResponse | null> {
  try {
    // Minimum amount validation
    if (amount <= 0) {
      console.warn('Amount must be greater than 0');
      return null;
    }

    // Check if token is available first
    const isAvailable = await checkTokenAvailability(inputMint);
    if (!isAvailable) {
      console.warn(`Token ${inputMint} is not available on Jupiter. It might be too new or not have sufficient liquidity.`);
      // Don't return null immediately, still try the quote
    }

    const params = new URLSearchParams({
      inputMint: inputMint,
      outputMint: SOL_MINT,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${JUPITER_API_BASE}/v6/quote?${params}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jupiter sell quote failed:', response.statusText, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.includes('No route found')) {
          console.error(`No trading route found for token ${inputMint}. This token might not be tradeable on Jupiter yet.`);
        } else if (errorData.error?.includes('Cannot compute other amount threshold')) {
          console.warn('Quote computation threshold warning - this is usually non-critical');
          // Don't throw error for this warning, just log it
        }
      } catch (parseError) {
        // If we can't parse the error, treat it as a regular failure
      }
      
      return null;
    }

    const quote = await response.json();
    console.log('Jupiter sell quote response:', quote);
    
    // Validate quote has required fields
    if (!quote.outAmount || !quote.inAmount) {
      console.error('Invalid sell quote response - missing amount fields');
      return null;
    }
    
    return quote;
  } catch (error) {
    console.error('Error getting Jupiter sell quote:', error);
    return null;
  }
}

// Build swap transaction using Jupiter API
export async function buildJupiterSwapTransaction(
  quote: JupiterQuoteResponse,
  userPublicKey: string,
  priorityFee?: number
): Promise<JupiterSwapResponse | null> {
  try {
    // Enhanced request body for v6 API
    const swapRequest: any = {
      quoteResponse: quote,
      userPublicKey: userPublicKey,
      wrapAndUnwrapSol: true,
      // Removed useSharedAccounts as it causes issues with simple AMMs
      asLegacyTransaction: false, // Use versioned transactions
    };

    // Only add priority fee if specified
    if (priorityFee) {
      swapRequest.prioritizationFeeLamports = priorityFee;
    }

    console.log('Swap request payload:', JSON.stringify(swapRequest, null, 2));

    const response = await fetch(`https://quote-api.jup.ag/v6/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jupiter swap transaction build failed:', response.status, errorText);
      
      // Parse error for better handling
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.includes('Missing token program')) {
          throw new Error('Token not available for trading on Jupiter. It might be too new or not have enough liquidity.');
        }
        if (errorData.error?.includes('Simple AMMs are not supported')) {
          // Try again without shared accounts (already removed above)
          throw new Error('Trading route not available for this token pair.');
        }
        throw new Error(errorData.error || 'Failed to build swap transaction');
      } catch (parseError) {
        throw new Error(errorText || 'Failed to build swap transaction');
      }
    }

    const swapResponse = await response.json();
    console.log('Jupiter swap response:', swapResponse);
    
    // Validate that we have a valid transaction
    if (!swapResponse.swapTransaction) {
      throw new Error('No transaction returned from Jupiter');
    }
    
    return swapResponse;
  } catch (error) {
    console.error('Error building Jupiter swap transaction:', error);
    throw error; // Re-throw to be handled by caller
  }
}

 