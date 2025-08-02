#!/usr/bin/env node

const crypto = require("crypto");

console.log("🔑 ICP Identity Seed Generator\n");

// Generate different types of seeds
console.log("1. 📝 Simple readable seed:");
const readableSeed = `cross-chain-relayer-${Date.now()}-${crypto
  .randomBytes(8)
  .toString("hex")}`;
console.log(`   ${readableSeed}`);

console.log("\n2. 🔐 Secure random hex seed:");
const hexSeed = crypto.randomBytes(32).toString("hex");
console.log(`   ${hexSeed}`);

console.log("\n3. 🎯 Production-ready seed:");
const prodSeed = `relayer-${crypto.randomUUID().replace(/-/g, "")}`;
console.log(`   ${prodSeed}`);

console.log("\n📋 Add any of these to your relayer-service/.env file:");
console.log(`ICP_IDENTITY_SEED=${readableSeed}`);

console.log("\n💡 Tips:");
console.log("• Use readable seed for development");
console.log("• Use hex seed for production");
console.log("• Keep your seed secret and backed up");
console.log("• Same seed = same ICP Principal ID");

console.log("\n🚀 Next steps:");
console.log("1. Copy one of the seeds above");
console.log("2. Update relayer-service/.env file");
console.log("3. Start your relayer service");
console.log("4. Check logs for successful identity creation");
