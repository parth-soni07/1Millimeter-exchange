# Cross-Chain Relayer Service

A production-ready off-chain relayer service that facilitates cross-chain communication between Ethereum and ICP blockchains for atomic swaps.

## Features

- **Event Listening**: Monitors CrossChainMessage events from Ethereum ICPBridge contract
- **ICP Integration**: Creates swap intents on ICP canister automatically
- **Message Processing**: Marks messages as processed on Ethereum side
- **Retry Mechanism**: Robust retry logic for failed operations
- **Health Monitoring**: Built-in health checks and metrics
- **Graceful Shutdown**: Proper cleanup on service termination
- **Comprehensive Logging**: Structured logging with rotation

## Prerequisites

- Node.js 16+
- Access to Ethereum RPC endpoint (Infura, Alchemy, etc.)
- ICP canister deployed and accessible
- Ethereum private key with sufficient ETH for gas fees

## Installation

```bash
cd relayer-service
npm install
```

## Configuration

1. Copy the environment template:

```bash
cp env.example .env
```

2. Update `.env` with your configuration:

```bash
# Ethereum Configuration
ETHEREUM_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=0x...
ETHEREUM_CHAIN_ID=5

# Contract Addresses (from deployment)
ICP_BRIDGE_ADDRESS=0x...
CROSS_CHAIN_RESOLVER_ADDRESS=0x...

# ICP Configuration
ICP_HOST=https://ic0.app
ICP_CANISTER_ID=your-canister-id
ICP_IDENTITY_SEED=your-seed-phrase

# Relayer Settings
RELAYER_NAME=my-relayer
POLLING_INTERVAL_MS=5000
RETRY_ATTEMPTS=3
```

## Usage

### Start the relayer:

```bash
npm start
```

### Development mode with auto-restart:

```bash
npm run dev
```

### Check health:

```bash
curl http://localhost:3000/health
```

### View metrics:

```bash
curl http://localhost:3000/metrics
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /metrics` - Service metrics and statistics
- `GET /config` - View sanitized configuration

## Monitoring

The relayer provides comprehensive monitoring through:

### Health Checks

```json
{
  "status": "healthy",
  "relayer": {
    "running": true,
    "uptime": 3600000,
    "messagesProcessed": 42,
    "messagesErrored": 1,
    "retryQueueSize": 0
  },
  "ethereum": {
    "connected": true,
    "blockNumber": 9123456,
    "walletAddress": "0x...",
    "balance": "1.5 ETH"
  },
  "icp": {
    "connected": true,
    "canisterId": "rrkah-fqaaa-aaaaa-aaaaq-cai",
    "principal": "rdmx6-jaaaa-aaaah-qcaaw-cai"
  }
}
```

### Metrics

- Messages processed/errored counts
- Retry queue size
- Service uptime
- Blockchain connection status
- Wallet balances

## Logging

Logs are written to:

- Console (development)
- `logs/relayer.log` (general logs)
- `logs/error.log` (error logs only)

Log format includes:

- Timestamp
- Log level
- Message
- Structured metadata (swap IDs, transaction hashes, etc.)

## Architecture

```
┌─────────────────┐    Events    ┌─────────────────┐
│   Ethereum      │─────────────→│   Relayer       │
│   ICPBridge     │              │   Service       │
└─────────────────┘              └─────────────────┘
                                          │
                                          │ Create Intent
                                          ▼
                                 ┌─────────────────┐
                                 │   ICP Canister  │
                                 │   (HTLC)        │
                                 └─────────────────┘
```

## Process Flow

1. **Event Detection**: Listens for `CrossChainMessage` events from ICPBridge
2. **Validation**: Validates message data and checks for duplicates
3. **Intent Creation**: Creates corresponding swap intent on ICP canister
4. **Confirmation**: Marks message as processed on Ethereum
5. **Retry Logic**: Handles failures with exponential backoff

## Error Handling

- **Network Issues**: Automatic retry with exponential backoff
- **Invalid Messages**: Logged and skipped
- **Gas Issues**: Configurable gas price limits
- **ICP Errors**: Retry mechanism with proper error categorization

## Security Considerations

- Private keys stored in environment variables
- No sensitive data in logs
- Configurable gas limits to prevent excessive fees
- Message validation to prevent malicious processing

## Production Deployment

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

### Systemd Service

```ini
[Unit]
Description=Cross-Chain Relayer
After=network.target

[Service]
Type=simple
User=relayer
WorkingDirectory=/opt/relayer
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Monitoring & Alerting

Set up monitoring for:

- Service health endpoint
- Error rates in logs
- Ethereum balance levels
- Message processing delays
- ICP canister responsiveness

## Development

### Running Tests

```bash
npm test
```

### Code Formatting

```bash
npm run format
npm run lint
```

### Adding New Features

1. Update configuration schema if needed
2. Add proper error handling and logging
3. Include health check updates
4. Add appropriate tests
5. Update documentation

## Troubleshooting

### Common Issues

**Connection Issues**:

- Check RPC endpoints are accessible
- Verify private key has sufficient balance
- Confirm contract addresses are correct

**Message Processing Failures**:

- Check ICP canister is responsive
- Verify message format is correct
- Review error logs for specific issues

**High Gas Costs**:

- Adjust `MAX_GAS_PRICE_GWEI` setting
- Monitor network congestion
- Consider batching operations

## Support

For issues and questions:

1. Check the logs in `logs/` directory
2. Verify configuration in `/config` endpoint
3. Monitor health status via `/health` endpoint
4. Review retry queue size in metrics
