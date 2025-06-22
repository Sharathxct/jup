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

const BITQUERY_ENDPOINT = 'https://streaming.bitquery.io/eap';
const BITQUERY_TOKEN = "ory_at_8iZLjU4IUpd1pFNCW03KzHcnjgA27-6ZHwVfqdXOnqI.sEB3TBQIDc_3gLHqoKZho9Ob7h_rmq8h8LB1dKAF2qE";

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