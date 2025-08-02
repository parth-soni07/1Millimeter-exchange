#!/usr/bin/env node

const crypto = require("crypto");

// Function to create identity from seed (simplified version)
function createIdentityFromSeed(seed) {
  const seedBuffer = Buffer.from(seed, "utf8");
  const hash = crypto.createHash("sha256").update(seedBuffer).digest();

  // This is a simplified version - actual implementation needs @dfinity/identity
  return {
    principal: "rdmx6-jaaaa-aaaah-qcaiq-cai", // Placeholder
    hash: hash.toString("hex").substring(0, 16),
  };
}

// Function to validate canister ID format
function validateCanisterId(canisterId) {
  // ICP canister IDs can have varying lengths but follow pattern: groups separated by dashes
  // Examples: rrkah-fqaaa-aaaaa-aaaaq-cai, 5efnn-telku-74vvo-k7d22-adlyf-p4kkz-ehcns-3dxsp-s5x5m-okk6e-yae
  const pattern =
    /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$/;
  return pattern.test(canisterId) && canisterId.length >= 20;
}

console.log("🔍 ICP Setup Verification Tool\n");

// Read environment from command line or use defaults
const args = process.argv.slice(2);
const seed = args[0] || "test-seed-example";
const canisterId =
  args[1] || "5efnn-telku-74vvo-k7d22-adlyf-p4kkz-ehcns-3dxsp-s5x5m-okk6e-yae";

console.log("📋 Current Configuration:");
console.log(`Seed: ${seed}`);
console.log(`Canister ID: ${canisterId}`);

console.log("\n🔍 Validation Results:");

// Validate seed
if (seed && seed.length > 0) {
  console.log("✅ Seed: Valid format");
  const identity = createIdentityFromSeed(seed);
  console.log(`   Hash prefix: ${identity.hash}`);
} else {
  console.log("❌ Seed: Missing or empty");
}

// Validate canister ID
if (validateCanisterId(canisterId)) {
  console.log("✅ Canister ID: Valid format");
} else {
  console.log("❌ Canister ID: Invalid format");
  console.log("   Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx");
}

console.log("\n🎯 What these identifiers mean:");
console.log("\n1. 🔑 Identity Seed:");
console.log("   • Used to generate your ICP identity");
console.log("   • Creates consistent Principal ID");
console.log("   • Enables signing transactions");
console.log("   • Keep this SECRET");

console.log("\n2. 🏠 Canister ID:");
console.log("   • Unique identifier for your ICP canister");
console.log("   • Public address for your smart contract");
console.log("   • Target for cross-chain messages");
console.log("   • Safe to share publicly");

console.log("\n3. 👤 Principal ID (generated from seed):");
console.log("   • Your unique identity on ICP");
console.log("   • Used for authorization");
console.log("   • Derived from your seed");
console.log("   • Example: rdmx6-jaaaa-aaaah-qcaiq-cai");

console.log("\n🔧 Common Canister Sources:");
console.log("1. 🏗️  Deploy your own:");
console.log("   dfx deploy cross-chain-canister-backend");

console.log("\n2. 🌐 Use existing canister:");
console.log("   • Get from ICP dashboard");
console.log("   • Copy from dfx.json");
console.log("   • Provided by team/project");

console.log("\n3. 🧪 Test canister:");
console.log("   • Use playground canister for testing");
console.log("   • Deploy to local replica first");

console.log("\n📝 Environment File Example:");
console.log("```");
console.log("# ICP Configuration");
console.log("ICP_HOST=https://ic0.app");
console.log(`ICP_CANISTER_ID=${canisterId}`);
console.log(`ICP_IDENTITY_SEED=${seed}`);
console.log("```");

console.log("\n🚀 Next Steps:");
console.log("1. Generate your identity seed (if needed)");
console.log("2. Get/deploy your canister");
console.log("3. Update relayer-service/.env");
console.log("4. Test connection with relayer service");

console.log("\n💡 Commands to generate seeds:");
console.log("node generate-icp-seed.js");
console.log("OR");
console.log(
  "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
);

if (args.length === 0) {
  console.log("\n🔧 Usage:");
  console.log("node verify-icp-setup.js [SEED] [CANISTER_ID]");
  console.log("Example:");
  console.log(
    'node verify-icp-setup.js "my-seed" "rrkah-fqaaa-aaaaa-aaaaq-cai"'
  );
}
