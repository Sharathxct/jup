# Pulse Service - Real-time Token Tracking

## Overview
This service provides real-time tracking of Pump.fun tokens through WebSocket connections to Bitquery API.

## Key Features

### 🔗 Single WebSocket Connection
- **Singleton Pattern**: Prevents multiple WebSocket connections
- **Three Subscriptions**: New tokens, Final Stretch (95%+ bonding curve), and Migrated tokens
- **Auto-reconnection**: Built-in reconnection logic with exponential backoff

### 🎯 Pump Token Filtering
- **New Tokens**: All tokens created through Pump.fun program
- **Final Stretch**: Only tokens with mint addresses ending in "pump" 
- **Migrated**: Only pump tokens (ending in "pump") that get migrated to AMM pools

### 📊 Data Processing
- **Real-time Updates**: Tokens appear as soon as they're detected on-chain
- **Duplicate Prevention**: Filters out duplicate tokens across all sections
- **Memory Management**: Limits to 100 tokens per section

## Token Identification

### Pump Token Address Pattern
All tokens created by Pump.fun have mint addresses ending with "pump":
- Example: `5rPdp2TPnSo95XN2k2R8VonkiuUZSDd4WG9J17Mmpump`
- Example: `84W51kYcdzZxTogs4auhQ2nM4AsLrudjw2HWh95Qpump`

### Filtering Logic
- **New Pairs**: No filtering needed (all from Pump.fun program)
- **Final Stretch**: Only tokens with `mintAddress.endsWith('pump')`
- **Migrated**: Only tokens with `mintAddress.endsWith('pump')` in migration transactions

## Contract Addresses
- **Pump.fun Program**: `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`
- **Pump AMM (Migration)**: `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`

## Files Structure
- `api.ts`: WebSocket manager, types, and data processing functions
- `query.ts`: TanStack Query hooks for state management
- `migration.ts`: Reserved for future migration utilities 