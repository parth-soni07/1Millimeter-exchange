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
