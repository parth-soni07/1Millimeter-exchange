import { ethers } from "ethers";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { ICP_CONFIG } from "../config";
import { idlFactory as IcrcIdl } from "./idl/icrc1.did.js";

// ---------------- ETH ----------------
export const getEthBalance = async (signer, tokenMeta) => {
  if (!signer) return "0";
  const address = await signer.getAddress();
  if (!tokenMeta.address) {
    const bal = await signer.provider.getBalance(address);
    return ethers.formatUnits(bal, 18);
  }
  const abi = ["function balanceOf(address) view returns (uint256)"];
  const contract = new ethers.Contract(tokenMeta.address, abi, signer);
  const bal = await contract.balanceOf(address);
  return ethers.formatUnits(bal, tokenMeta.decimals);
};

// ---------------- ICP ----------------
export const getIcpBalance = async (principal, tokenMeta, authClient) => {
  try {
    if (!principal) return "0";
    if (!tokenMeta.canisterId) return "0"; // skip native ICP for now

    // Get identity from authClient
    const identity = authClient?.getIdentity();
    if (!identity) {
      console.warn("No identity available from authClient");
      return "0";
    }

    const agent = new HttpAgent({ identity, host: ICP_CONFIG.HOST });

    // needed for local replica
    if (
      ICP_CONFIG.HOST.includes("localhost") ||
      ICP_CONFIG.HOST.includes("127.0.0.1")
    ) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(IcrcIdl, {
      agent,
      canisterId: tokenMeta.canisterId,
    });

    // ICRC-1 Account format: subaccount should be null for default account
    const account = {
      owner:
        typeof principal === "string"
          ? Principal.fromText(principal)
          : principal,
      subaccount: [], // empty array indicates no subaccount
    };

    console.log(`Fetching balance for ${tokenMeta.symbol}:`, {
      canisterId: tokenMeta.canisterId,
      account: account,
    });

    const raw = await actor.icrc1_balance_of(account);
    const balance = (Number(raw) / 10 ** tokenMeta.decimals).toString();

    console.log(`Balance for ${tokenMeta.symbol}:`, {
      raw: raw.toString(),
      formatted: balance,
    });

    return balance;
  } catch (error) {
    console.error(`Error fetching ICP balance for ${tokenMeta.symbol}:`, error);
    return "0";
  }
};
