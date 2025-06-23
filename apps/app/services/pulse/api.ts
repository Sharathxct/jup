// Types for the Bitquery token data
export interface TokenSupplyUpdate {
  Block: {
    Time: string;
  };
  Transaction: {
    Signer: string;
  };
  TokenSupplyUpdate: {
    Amount: string;
    Currency: {
      Symbol: string;
      ProgramAddress: string;
      PrimarySaleHappened: boolean;
      Native: boolean;
      Name: string;
      MintAddress: string;
      MetadataAddress: string;
      Key: string;
      IsMutable: boolean;
      Fungible: boolean;
      EditionNonce: number;
      Decimals: number;
      Wrapped: boolean;
      VerifiedCollection: boolean;
      Uri: string;
      UpdateAuthority: string;
      TokenStandard: string;
    };
    PostBalance: string;
  };
}

export interface DEXPoolUpdate {
  Pool: {
    Market: {
      BaseCurrency: {
        MintAddress: string;
        Name: string;
        Symbol: string;
      };
      MarketAddress: string;
      QuoteCurrency: {
        MintAddress: string;
        Name: string;
        Symbol: string;
      };
    };
    Dex: {
      ProtocolName: string;
      ProtocolFamily: string;
    };
    Base: {
      PostAmount: string;
    };
    Quote: {
      PostAmount: string;
      PriceInUSD: number;
      PostAmountInUSD: string;
    };
  };
}

export interface MigratedTokenUpdate {
  Block: {
    Height: string;
    Time: string;
  };
  Transaction: {
    Fee: string;
    FeeInUSD: string;
    Signature: string;
    Signer: string;
    FeePayer: string;
    Result: {
      Success: boolean;
      ErrorMessage: string;
    };
  };
  Instruction: {
    Accounts: Array<{
      Address: string;
      IsWritable: boolean;
      Token: {
        Mint: string;
        Owner: string;
        ProgramId: string;
      };
    }>;
    Program: {
      Address: string;
      Name: string;
      Method: string;
      Arguments: Array<{
        Name: string;
        Type: string;
        Value: {
          integer?: number;
          bigInteger?: string;
          string?: string;
          address?: string;
          bool?: boolean;
          float?: number;
          hex?: string;
          json?: any;
        };
      }>;
    };
  };
}

export interface BitqueryResponse {
  Solana: {
    TokenSupplyUpdates: TokenSupplyUpdate[];
    DEXPools?: DEXPoolUpdate[];
    Instructions?: MigratedTokenUpdate[];
  };
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  showName?: boolean;
  createdOn?: string;
  twitter?: string;
  website?: string;
}

export interface ProcessedToken {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change: string;
  changePercent: number;
  marketCap: string;
  volume: string;
  age: string;
  holders: number;
  txns: number;
  chart: string;
  tags: string[];
  mintAddress: string;
  uri: string;
  timestamp: string;
  metadata?: TokenMetadata;
}

const BITQUERY_TOKEN = "ory_at_10Lps2s1RKWZVM9w_ofp8QT-n9c_cEhET4Afcc9Q8Oo.IHESG9yvcnECPOOtSHm7OBoy0yoovV0O_3hpwLk3NAA";
const WS_URL = `wss://streaming.bitquery.io/eap?token=${BITQUERY_TOKEN}`;

const NEW_TOKENS_SUBSCRIPTION = `
subscription {
  Solana {
    TokenSupplyUpdates(
      where: {Instruction: {Program: {Address: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}, Method: {is: "create"}}}}
    ) {
      Block{
        Time
      }
      Transaction{
        Signer
      }
      TokenSupplyUpdate {
        Amount
        Currency {
          Symbol
          ProgramAddress
          PrimarySaleHappened
          Native
          Name
          MintAddress
          MetadataAddress
          Key
          IsMutable
          Fungible
          EditionNonce
          Decimals
          Wrapped
          VerifiedCollection
          Uri
          UpdateAuthority
          TokenStandard
        }
        PostBalance
      }
    }
  }
}`;

const FINAL_STRETCH_SUBSCRIPTION = `
subscription {
  Solana {
    DEXPools(
      where: {Pool: {Base: {PostAmount: {gt: "206900000", lt: "246555000"}}, Dex: {ProgramAddress: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}}, Market: {QuoteCurrency: {MintAddress: {is: "11111111111111111111111111111111"}}}}, Transaction: {Result: {Success: true}}}
    ) {
      Pool {
        Market {
          BaseCurrency {
            MintAddress
            Name
            Symbol
          }
          MarketAddress
          QuoteCurrency {
            MintAddress
            Name
            Symbol
          }
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        Base {
          PostAmount
        }
        Quote {
          PostAmount
          PriceInUSD
          PostAmountInUSD
        }
      }
    }
  }
}`;

const MIGRATED_TOKENS_SUBSCRIPTION = `
subscription {
  Solana {
    Instructions( 
      where: {Instruction: {Program: {Method: {is: "create_pool"}, Address: {is: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"}}}}
    ) {
      Instruction {
        Program {
          Address
          Name
          Method
          Arguments {
            Name
            Type
            Value {
              ... on Solana_ABI_Json_Value_Arg {
                json
              }
              ... on Solana_ABI_Float_Value_Arg {
                float
              }
              ... on Solana_ABI_Boolean_Value_Arg {
                bool
              }
              ... on Solana_ABI_Bytes_Value_Arg {
                hex
              }
              ... on Solana_ABI_BigInt_Value_Arg {
                bigInteger
              }
              ... on Solana_ABI_Address_Value_Arg {
                address
              }
              ... on Solana_ABI_String_Value_Arg {
                string
              }
              ... on Solana_ABI_Integer_Value_Arg {
                integer
              }
            }
          }
        }
        Accounts {
          Address
          IsWritable
          Token {
            Mint
            Owner
            ProgramId
          }
        }
      }
      Transaction {
        Fee
        FeeInUSD
        Signature
        Signer
        FeePayer
        Result {
          Success
          ErrorMessage
        }
      }
      Block {
        Time
        Height
      }
    }
  }
}`;

export class PulseWebSocketManager {
  private static instance: PulseWebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onDataCallback: ((data: BitqueryResponse) => void) | null = null;
  private isConnecting = false;

  // Singleton pattern to prevent multiple connections
  static getInstance(): PulseWebSocketManager {
    if (!PulseWebSocketManager.instance) {
      PulseWebSocketManager.instance = new PulseWebSocketManager();
    }
    return PulseWebSocketManager.instance;
  }

  connect(onData: (data: BitqueryResponse) => void) {
    // Prevent multiple connection attempts
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      this.onDataCallback = onData; // Update callback
      return;
    }

    this.isConnecting = true;
    this.onDataCallback = onData;
    this.ws = new WebSocket(WS_URL, ["graphql-ws"]);

    this.ws.onopen = () => {
      console.log("Connected to Bitquery WebSocket");
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Send connection init
      this.send({ type: "connection_init" });
    };

    this.ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      
      if (response.type === "connection_ack") {
        console.log("Connection acknowledged, starting subscriptions");
        
        // Start all three subscriptions
        this.send({
          type: "start",
          id: "new-tokens",
          payload: {
            query: NEW_TOKENS_SUBSCRIPTION,
          },
        });

        this.send({
          type: "start",
          id: "final-stretch",
          payload: {
            query: FINAL_STRETCH_SUBSCRIPTION,
          },
        });

        this.send({
          type: "start",
          id: "migrated-tokens",
          payload: {
            query: MIGRATED_TOKENS_SUBSCRIPTION,
          },
        });
      }

      if (response.type === "data" && response.payload?.data) {
        this.onDataCallback?.(response.payload.data);
      }

      if (response.type === "ka") {
        // Keep-alive, no action needed
      }

      if (response.type === "error") {
        console.error("WebSocket error:", response.payload?.errors);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.isConnecting = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnecting = false;
    };
  }

  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.onDataCallback) {
          this.connect(this.onDataCallback);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.send({ type: "stop", id: "new-tokens" });
      this.send({ type: "stop", id: "final-stretch" });
      this.send({ type: "stop", id: "migrated-tokens" });
      this.ws.close();
      this.ws = null;
    }
  }
}

// Fetch token metadata from URI
export async function fetchTokenMetadata(uri: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

// Process raw token data into UI format
export function processTokenData(tokenUpdate: TokenSupplyUpdate): ProcessedToken {
  const currency = tokenUpdate.TokenSupplyUpdate.Currency;
  const timestamp = tokenUpdate.Block.Time;
  const timeAgo = getTimeAgo(timestamp);
  
  // Generate a random price and change for display (since we don't have market data yet)
  const randomPrice = Math.floor(Math.random() * 100000) + 1000;
  const randomChange = Math.floor(Math.random() * 50000) + 500;
  const randomChangePercent = Math.floor(Math.random() * 100) + 1;
  
  return {
    id: currency.MintAddress,
    name: currency.Name || currency.Symbol,
    symbol: currency.Symbol,
    icon: '🔷', // Default icon, will be updated with metadata
    price: `$${randomPrice}`,
    change: `$${randomChange}`,
    changePercent: randomChangePercent,
    marketCap: 'MC',
    volume: 'v',
    age: timeAgo,
    holders: Math.floor(Math.random() * 1000) + 10,
    txns: Math.floor(Math.random() * 500) + 5,
    chart: Math.random() > 0.5 ? 'trending_up' : 'trending_down',
    tags: ['DS', '0%', '0%', `${Math.floor(Math.random() * 20)}%`],
    mintAddress: currency.MintAddress,
    uri: currency.Uri,
    timestamp,
  };
}

// Process Final Stretch token data (95% bonding curve completion)
export function processFinalStretchData(poolUpdate: DEXPoolUpdate): ProcessedToken | null {
  const currency = poolUpdate.Pool.Market.BaseCurrency;
  
  // Only process pump tokens (mint address ends with "pump")
  if (!currency.MintAddress.endsWith('pump')) {
    return null;
  }
  
  const timestamp = new Date().toISOString(); // Current time since no timestamp in pool data
  const timeAgo = getTimeAgo(timestamp);
  
  // Calculate bonding curve progress
  const baseAmount = parseFloat(poolUpdate.Pool.Base.PostAmount);
  const progress = Math.min(((baseAmount - 206900000) / (246555000 - 206900000)) * 5 + 95, 100);
  
  // Use actual market data
  const priceUSD = parseFloat(poolUpdate.Pool.Quote.PostAmountInUSD);
  const quoteAmount = parseFloat(poolUpdate.Pool.Quote.PostAmount);
  
  return {
    id: currency.MintAddress,
    name: currency.Name || currency.Symbol,
    symbol: currency.Symbol,
    icon: '🔥', // Fire icon for final stretch
    price: `$${priceUSD.toLocaleString()}`,
    change: `${quoteAmount.toFixed(2)} SOL`,
    changePercent: Math.floor(progress),
    marketCap: 'MC',
    volume: 'v',
    age: timeAgo,
    holders: Math.floor(Math.random() * 5000) + 1000,
    txns: Math.floor(Math.random() * 1000) + 100,
    chart: 'trending_up',
    tags: ['DS', `${progress.toFixed(1)}%`, 'Final Stretch'],
    mintAddress: currency.MintAddress,
    uri: '', // No URI available in pool data
    timestamp,
  };
}

// Process Migrated token data
export function processMigratedData(instruction: MigratedTokenUpdate): ProcessedToken | null {
  const timestamp = instruction.Block.Time;
  const timeAgo = getTimeAgo(timestamp);
  
  // Try to extract pump token info from accounts (look for tokens ending with "pump")
  const tokenAccounts = instruction.Instruction.Accounts.filter(acc => 
    acc.Token.Mint && 
    acc.Token.Mint !== 'So11111111111111111111111111111111112' &&
    acc.Token.Mint.endsWith('pump')
  );
  
  if (tokenAccounts.length === 0) {
    // No pump tokens found in this migration
    return null;
  }
  
  const baseMint = tokenAccounts[0].Token.Mint;
  
  // Extract amounts from arguments
  const baseAmountArg = instruction.Instruction.Program.Arguments.find(arg => arg.Name === 'base_amount_in');
  const quoteAmountArg = instruction.Instruction.Program.Arguments.find(arg => arg.Name === 'quote_amount_in');
  
  const baseAmount = baseAmountArg?.Value.bigInteger ? parseInt(baseAmountArg.Value.bigInteger) / 1000000 : 0;
  const quoteAmount = quoteAmountArg?.Value.bigInteger ? parseInt(quoteAmountArg.Value.bigInteger) / 1000000000 : 0;
  
  return {
    id: baseMint,
    name: `Migrated Token`,
    symbol: 'MIG',
    icon: '🚀', // Rocket icon for migrated tokens
    price: `$${(quoteAmount * 128).toLocaleString()}`, // Rough price calculation
    change: `${quoteAmount.toFixed(2)} SOL`,
    changePercent: Math.floor(Math.random() * 50) + 10,
    marketCap: 'MC',
    volume: 'v',
    age: timeAgo,
    holders: Math.floor(Math.random() * 10000) + 5000,
    txns: Math.floor(Math.random() * 2000) + 500,
    chart: 'trending_up',
    tags: ['Migrated', 'Raydium', 'Liquid'],
    mintAddress: baseMint,
    uri: '', // No URI available in instruction data
    timestamp,
  };
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds < 60) {
    return `${diffSeconds}s`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else {
    return `${diffHours}h`;
  }
}
