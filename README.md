# Blaze Trade

A real-time token trading platform built for the Jupiverse Hackathon that fetches tokens from the Pump.fun program, provides advanced filtering capabilities, and enables seamless token swapping through Jupiter's APIs.

## 🚀 Features

- **Real-time Token Data**: Fetches live token information from the Pump.fun program
- **Advanced Filtering**: Filter tokens based on various metrics and performance indicators
- **Seamless Trading**: Buy and sell tokens using Jupiter's quote and swap APIs
- **Live Price Data**: Real-time price updates and OHLCV data through WebSocket connections
- **Intuitive UI**: Clean, responsive interface for optimal trading experience

## 🏗️ Architecture

Blaze Trade is built on a modern, scalable architecture:

- **Frontend (UI)**: Next.js application providing the trading interface
- **WebSocket Provider**: Indexes the Pump program and operates on a pub/sub model
- **Real-time Data**: Provides live token details and OHLCV data
- **Jupiter Integration**: Utilizes Jupiter's quote API for pricing and swap API for trading
- **Turbo Repo**: Monorepo structure for efficient development and deployment

## 🛠️ Local Setup

### Prerequisites
- Node.js (v18 or higher)
- pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Sharathxct/jup.git
   cd jup
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## 📦 What's Inside?

This Turborepo includes the following packages and applications:

### Apps
- `app`: Next.js frontend application with trading interface
- `api`: Express.js backend server for data processing

### Packages
- `@repo/ui`: Shared React component library
- `@repo/logger`: Isomorphic logging utility
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configurations
- `@repo/jest-presets`: Jest testing configurations

## 🔧 Technologies

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Express.js, Node.js
- **Real-time**: WebSockets for live data streaming
- **APIs**: Jupiter Quote & Swap APIs, Pump.fun program integration
- **Styling**: Modern CSS with responsive design
- **Development**: Turbo for build orchestration, ESLint, Prettier

## 🌟 Jupiter Integration

Blaze Trade leverages Jupiter's powerful APIs:

- **Quote API**: Real-time price quotes for accurate trading decisions
- **Swap API**: Seamless token swapping with optimal routing
- **Price Monitoring**: Continuous price tracking for better market insights

## 🏆 Jupiverse Hackathon

This project was developed for the Jupiverse Hackathon, showcasing the potential of Jupiter's ecosystem for building advanced DeFi trading platforms.

