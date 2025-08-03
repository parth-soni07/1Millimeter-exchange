#!/bin/bash

# Configuration Generator for ICP Cross-Chain Resolver
# This script creates all necessary .env files from your filled values

echo "🚀 Generating configuration files for ICP Cross-Chain Resolver..."

# Your provided values
INFURA_KEY="2184f26db5a945189b11592133de7526"
PRIVATE_KEY="11318539cf2b90cd07feef07bfd119456e16ff441df48f"
ICP_CANISTER_ID="uzt4z-lp777-77774-qaabq-cai&id=uxrrr-q7777-77774-qaaaq-cai"
ICP_PRINCIPAL="5efnn-telku-74vvo-k7d22-adlyf-p4kkz-ehcns-3dxsp-s5x5m-okk6e-yae"

# Check for missing values
echo "🔍 Checking configuration..."

MISSING_COUNT=0

# Check for Etherscan API key
read -p "Enter your Etherscan API key (get from https://etherscan.io/apis): " ETHERSCAN_API_KEY
if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo "⚠️  Etherscan API key not provided - you can add it later"
    ETHERSCAN_API_KEY="..."
fi

# Check for ICP Identity
read -p "Enter your ICP identity seed phrase (or press Enter to use file path): " ICP_IDENTITY_SEED
if [ -z "$ICP_IDENTITY_SEED" ]; then
    ICP_IDENTITY_SEED="..."
    echo "💡 You can also use your identity file at ~/.config/dfx/identity/default/identity.pem"
fi

echo ""
echo "📝 Creating configuration files..."

# Create cross-chain-resolver .env
cat > packages/cross-chain-resolver/.env << EOF
# ICP Cross-Chain Resolver - Smart Contracts Configuration

# RPC URLs
MAINNET_RPC_URL=https://eth.merkle.io
GOERLI_RPC_URL=https://goerli.infura.io/v3/$INFURA_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/$INFURA_KEY
HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
POLYGON_RPC_URL=https://polygon-rpc.com

# Private Key
PRIVATE_KEY=$PRIVATE_KEY

# API Keys
ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY
ARBISCAN_API_KEY=...
POLYGONSCAN_API_KEY=...

# 1inch Protocol Addresses
LIMIT_ORDER_PROTOCOL_ADDRESS=0x1111111254fb6c44bAC0beD2854e76F90643097d
ESCROW_FACTORY_ADDRESS=0x...

# Contract Addresses (will be set after deployment)
ICP_BRIDGE_ADDRESS=0x...
FUSION_RESOLVER_ADDRESS=0x...
ICP_RESOLVER_ADDRESS=0x...

# Gas Settings
REPORT_GAS=true
EOF

echo "✅ Created packages/cross-chain-resolver/.env"

# Create relayer service .env
mkdir -p packages/relayer-service
cat > packages/relayer-service/.env << EOF
# ICP Cross-Chain Relayer Service Configuration

# Ethereum Configuration
ETHEREUM_RPC_URL=https://eth.merkle.io
ETHEREUM_PRIVATE_KEY=$PRIVATE_KEY
ETHEREUM_CHAIN_ID=1

# Contract Addresses (update after deployment)
ICP_BRIDGE_ADDRESS=0x...
CROSS_CHAIN_RESOLVER_ADDRESS=0x...

# ICP Configuration
ICP_HOST=https://ic0.app
ICP_CANISTER_ID=$ICP_CANISTER_ID
ICP_IDENTITY_SEED=$ICP_IDENTITY_SEED

# Relayer Settings
RELAYER_NAME=icp-fusion-relayer
POLLING_INTERVAL_MS=5000
RETRY_ATTEMPTS=3
PORT=3000

# Gas Settings
MAX_GAS_PRICE_GWEI=50
GAS_LIMIT=300000

# Safety Settings
MIN_SAFETY_DEPOSIT_ETH=0.001

# Monitoring
DEBUG_LOGS=true
LOG_LEVEL=info
EOF

echo "✅ Created packages/relayer-service/.env"

# Create test configuration
cat > packages/cross-chain-resolver/test.env << EOF
# Test Configuration

# Test Network RPCs
MAINNET_RPC_URL=https://eth.merkle.io
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/$INFURA_KEY

# Test Private Keys (Hardhat default accounts)
TEST_USER_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
TEST_RESOLVER_PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

# Test ICP Configuration
TEST_ICP_CANISTER_ID=$ICP_CANISTER_ID
TEST_ICP_RECEIVER=rdmx6-jaaaa-aaaah-qcaaw-cai

# Test Amounts
TEST_USDC_AMOUNT=1000000000
TEST_ETH_AMOUNT=1000000000000000000
TEST_ICP_AMOUNT=10000000000

# Fork Configuration
MAINNET_FORK_BLOCK=18500000
EOF

echo "✅ Created packages/cross-chain-resolver/test.env"

# Create frontend .env if frontend exists
if [ -d "packages/frontend" ]; then
    cat > packages/frontend/.env << EOF
# Frontend Configuration

# Network Configuration
REACT_APP_ETHEREUM_CHAIN_ID=1
REACT_APP_ICP_HOST=https://ic0.app
REACT_APP_ICP_CANISTER_ID=$ICP_CANISTER_ID

# Contract Addresses (update after deployment)
REACT_APP_ICP_BRIDGE_ADDRESS=0x...
REACT_APP_FUSION_RESOLVER_ADDRESS=0x...

# API URLs
REACT_APP_RELAYER_URL=http://localhost:3000

# Features
REACT_APP_ENABLE_TESTNET=false
REACT_APP_DEBUG_MODE=true
EOF
    echo "✅ Created packages/frontend/.env"
fi

# Create deployment script
cat > deploy-contracts.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying ICP Cross-Chain Resolver Contracts..."

cd packages/cross-chain-resolver

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Run ./generate-config.sh first"
    exit 1
fi

# Choose network
echo "Select deployment network:"
echo "1) Sepolia Testnet (Recommended for testing)"
echo "2) Mainnet (⚠️  Real money!)"
echo "3) Local Hardhat"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        NETWORK="sepolia"
        echo "Deploying to Sepolia testnet..."
        ;;
    2)
        NETWORK="mainnet"
        echo "⚠️  WARNING: Deploying to MAINNET with real funds!"
        read -p "Are you absolutely sure? Type 'YES' to continue: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    3)
        NETWORK="localhost"
        echo "Deploying to local Hardhat network..."
        echo "Make sure to start local node first: npx hardhat node"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Deploy contracts
echo "Deploying contracts to $NETWORK..."
npx hardhat run scripts/deploy-icp-contracts.ts --network $NETWORK

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your .env files with the deployed contract addresses"
    echo "2. Update relayer service configuration"
    echo "3. Start the relayer service: cd packages/relayer-service && npm start"
    echo "4. Run tests to verify: npm test"
else
    echo "❌ Deployment failed! Check the error messages above."
    exit 1
fi
EOF

chmod +x deploy-contracts.sh
echo "✅ Created deploy-contracts.sh script"

# Create monitoring script
cat > monitor-system.sh << 'EOF'
#!/bin/bash

echo "📊 ICP Cross-Chain Resolver System Monitor"
echo "========================================="

# Check relayer health
echo "🔍 Checking relayer service..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Relayer service is running"
    echo "Health status:"
    curl -s http://localhost:3000/health | jq '.' 2>/dev/null || echo "Response received but not JSON formatted"
else
    echo "❌ Relayer service is not responding on port 3000"
fi

echo ""
echo "📈 Checking system metrics..."
if curl -s http://localhost:3000/metrics > /dev/null 2>&1; then
    curl -s http://localhost:3000/metrics | jq '.' 2>/dev/null || echo "Metrics endpoint available but not JSON formatted"
else
    echo "❌ Metrics endpoint not available"
fi

# Check Ethereum connectivity
echo ""
echo "🔗 Testing Ethereum connectivity..."
if curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    "https://eth.merkle.io" > /dev/null 2>&1; then
    echo "✅ Ethereum mainnet RPC is accessible"
else
    echo "❌ Ethereum RPC connection failed"
fi

# Check ICP connectivity
echo ""
echo "🌐 ICP Status:"
echo "Host: https://ic0.app"
echo "Canister ID: $ICP_CANISTER_ID"
echo "Principal: $ICP_PRINCIPAL"
echo ""
echo "💡 To check ICP canister status, run:"
echo "   dfx canister status $ICP_CANISTER_ID --network ic"
EOF

chmod +x monitor-system.sh
echo "✅ Created monitor-system.sh script"

echo ""
echo "🎉 Configuration files created successfully!"
echo ""
echo "📁 Created files:"
echo "  - packages/cross-chain-resolver/.env"
echo "  - packages/relayer-service/.env"
echo "  - packages/cross-chain-resolver/test.env"
if [ -d "packages/frontend" ]; then
    echo "  - packages/frontend/.env"
fi
echo "  - deploy-contracts.sh"
echo "  - monitor-system.sh"

echo ""
echo "🚀 Quick Start:"
echo "1. Install dependencies:"
echo "   cd packages/cross-chain-resolver && npm install"
echo ""
echo "2. Deploy contracts to testnet:"
echo "   ./deploy-contracts.sh"
echo ""
echo "3. Update contract addresses in .env files after deployment"
echo ""
echo "4. Start relayer service:"
echo "   cd packages/relayer-service && npm install && npm start"
echo ""
echo "5. Monitor system:"
echo "   ./monitor-system.sh"

echo ""
echo "⚠️  Missing configuration:"
if [ "$ETHERSCAN_API_KEY" = "..." ]; then
    echo "- Get Etherscan API key from: https://etherscan.io/apis"
fi
if [ "$ICP_IDENTITY_SEED" = "..." ]; then
    echo "- Set up ICP identity seed phrase in relayer .env file"
fi

echo ""
echo "🔒 Security reminders:"
echo "- Never commit .env files to git"
echo "- Keep your private keys secure"
echo "- Test on Sepolia before mainnet deployment"