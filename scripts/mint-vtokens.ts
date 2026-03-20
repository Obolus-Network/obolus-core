import { 
  BlockfrostProvider, 
  MeshWallet, 
  Transaction,
  Asset
} from "@meshsdk/core";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY || process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
const SEED_PHRASE = process.env.DEPLOYER_SEED_PHRASE;

if (!BLOCKFROST_KEY || !SEED_PHRASE) {
  console.error("❌ BLOCKFROST_KEY or DEPLOYER_SEED_PHRASE not found in .env.local");
  process.exit(1);
}

// vtokens_policy hash from plutus.json
const POLICY_ID = "6d2d42352a902630de378c3bf328aaef6ca9c0929bdb3c5c4231a490";
const TOKEN_NAME_STR = "vUSDCx";
const TOKEN_NAME_HEX = "76555344437800"; // Including trailing 00 from user specification

async function main() {
  console.log("🚀 Initializing Minting for vUSDCx on Preprod...");

  const provider = new BlockfrostProvider(BLOCKFROST_KEY!);
  
  const wallet = new MeshWallet({
    networkId: 0, // Preprod
    fetcher: provider,
    submitter: provider,
    key: {
      type: 'mnemonic',
      words: SEED_PHRASE!.split(" "),
    },
  });

  const address = await wallet.getChangeAddress();
  console.log(`📡 Connected Wallet: ${address}`);

  const amount = "1000000"; // 1.000000 display (6 decimals)
  
  console.log(`🔨 Minting ${amount} units of ${TOKEN_NAME_STR} (${TOKEN_NAME_HEX})...`);

  try {
    const tx = new Transaction({ initiator: wallet });
    
    // Using simple minting logic for demo
    tx.mintAsset(
      {
        code: "58a101010029800aba2aba1aab9faab9eaab9dab9a48888896600264646644b30013370e900018031baa00189991198008009bac300b30093754601600c6eb8c024c01cdd5000912cc00400629422b30015980099b8748008c020dd5180598049baa300b300937546016601860126ea8c02c006294629410074528c4cc008008c03000500720148b200a30070013007300800130070013003375400f149a26cac80081",
        version: "V3"
      },
      {
        assetName: TOKEN_NAME_STR,
        assetQuantity: amount,
        label: '721',
        recipient: address
      }
    );

    // Wait, MeshJS `mintAsset` signature changed.
    // I should check meshjs documentation/skills if I can.
    // I read Step 1238, it used:
    // tx.mintAsset(forgingScript, { assetName, assetQuantity, ... })

    console.log("📦 Building transaction...");
    const unsignedTx = await tx.build();
    
    console.log("✍️ Signing transaction...");
    const signedTx = await wallet.signTx(unsignedTx);
    
    console.log("📤 Submitting transaction...");
    const txHash = await wallet.submitTx(signedTx);

    console.log(`✅ Success! Tx Hash: ${txHash}`);
    console.log(`🔗 Link: https://preprod.cardanoscan.io/tx/${txHash}`);

    const result = {
      vUSDCx: {
        policyId: POLICY_ID,
        tokenName: TOKEN_NAME_HEX,
        assetId: POLICY_ID + TOKEN_NAME_HEX,
        decimals: 6,
        mintTxHash: txHash,
        network: "preprod"
      }
    };

    fs.writeFileSync(
      path.join(__dirname, "deployed-assets.json"), 
      JSON.stringify(result, null, 2)
    );
    console.log("📝 Saved asset details to scripts/deployed-assets.json");

  } catch (error) {
    console.error("❌ Minting failed:", error);
  }
}

main();
