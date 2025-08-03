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
