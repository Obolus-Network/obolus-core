import { MeshWallet, Transaction, BlockfrostProvider, ForgeScript, resolvePaymentKeyHash, resolveScriptHash } from "@meshsdk/core"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: ".env.local" })

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY || process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
const SEED_PHRASE = process.env.DEPLOYER_SEED_PHRASE;

const provider = new BlockfrostProvider(BLOCKFROST_KEY)

const wallet = new MeshWallet({
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: "mnemonic",
    words: SEED_PHRASE.split(" ")
  }
})

const tokenName = "vUSDCx"
const tokenNameHex = Buffer.from(tokenName, "utf-8").toString("hex")
const mintAmount = "1000000"

async function main() {
  const address = await wallet.getChangeAddress()
  const utxos = await wallet.getUtxos()
  
  if (utxos.length === 0) {
    console.error("❌ No UTxOs found. Please fund the wallet.")
    process.exit(1)
  }

  console.log(`📡 Connected Wallet: ${address}`)
  console.log(`🔨 Minting Native Test Token ${tokenName} (${tokenNameHex})...`)

  try {
    const tx = new Transaction({ initiator: wallet })
    
    // Create a native script policy belonging to the deployer wallet (bypassing Plutus V3 errors)
    const forgingScript = ForgeScript.withOneSignature(address)
    const policyId = resolveScriptHash(forgingScript)
    const assetId = policyId + tokenNameHex

    tx.mintAsset(
      forgingScript,
      {
        assetName: tokenName,
        assetQuantity: mintAmount,
        label: '20',
        recipient: address
      }
    )

    const unsignedTx = await tx.build()
    const signedTx = await wallet.signTx(unsignedTx)
    const txHash = await wallet.submitTx(signedTx)

    console.log("✅ Successfully Minted Native vUSDCx")
    console.log("TX Hash:", txHash)
    console.log("Policy ID:", policyId)
    console.log("Asset ID:", assetId)
    console.log("Explorer:", `https://preprod.cardanoscan.io/transaction/${txHash}`)

    // Save details
    const deployedAssets = {
      vUSDCx: {
        policyId,
        tokenName,
        tokenNameHex,
        assetId,
        decimals: 6,
        mintTxHash: txHash,
        network: "preprod"
      }
    }
    fs.writeFileSync(path.join(__dirname, "deployed-assets.json"), JSON.stringify(deployedAssets, null, 2))

    // Update config.ts directly for convenience
    const configPath = path.join(__dirname, "../lib/cardano/config.ts")
    let configContent = fs.readFileSync(configPath, 'utf8')
    configContent = configContent.replace(/policyId: ".*"/, `policyId: "${policyId}"`)
    configContent = configContent.replace(/assetId: ".*"/, `assetId: "${assetId}"`)
    fs.writeFileSync(configPath, configContent)

    console.log("📝 Updated lib/cardano/config.ts with new Asset ID")

  } catch (error) {
    console.error("❌ Minting failed:", error)
    if (error.data && error.data.message) {
        console.error("Blockfrost Error:", error.data.message)
    }
  }
}

main()
