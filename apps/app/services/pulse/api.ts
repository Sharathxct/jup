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

export interface BitqueryResponse {
  Solana: {
    TokenSupplyUpdates: TokenSupplyUpdate[];
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

const BITQUERY_TOKEN = "ory_at_8iZLjU4IUpd1pFNCW03KzHcnjgA27-6ZHwVfqdXOnqI.sEB3TBQIDc_3gLHqoKZho9Ob7h_rmq8h8LB1dKAF2qE";
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

export class PulseWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onDataCallback: ((data: BitqueryResponse) => void) | null = null;

  connect(onData: (data: BitqueryResponse) => void) {
    this.onDataCallback = onData;
    this.ws = new WebSocket(WS_URL, ["graphql-ws"]);

    this.ws.onopen = () => {
      console.log("Connected to Bitquery WebSocket");
      this.reconnectAttempts = 0;
      
      // Send connection init
      this.send({ type: "connection_init" });
    };

    this.ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      
      if (response.type === "connection_ack") {
        console.log("Connection acknowledged, starting subscription");
        this.send({
          type: "start",
          id: "new-tokens",
          payload: {
            query: NEW_TOKENS_SUBSCRIPTION,
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
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
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
