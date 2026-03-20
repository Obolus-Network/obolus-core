import { MeshWallet, MeshTxBuilder, BlockfrostProvider } from "@meshsdk/core"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: ".env.local" })

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY || process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
const SEED_PHRASE = process.env.DEPLOYER_SEED_PHRASE;

if (!BLOCKFROST_KEY || !SEED_PHRASE) {
  console.error("❌ BLOCKFROST_KEY or DEPLOYER_SEED_PHRASE not found in .env.local")
  process.exit(1)
}

const provider = new BlockfrostProvider(BLOCKFROST_KEY)

const wallet = new MeshWallet({
  networkId: 0, // 0 = testnet
  fetcher: provider,
  submitter: provider,
  key: {
    type: "mnemonic",
    words: SEED_PHRASE.split(" ")
  }
})

// Correct path to plutus.json based on workspace structure
// Current file: obolus-pay/scripts/mint-vtokens.mjs
// Target: obolus/obolus-contracts/plutus.json
const plutusPath = path.resolve(__dirname, "../../obolus/obolus-contracts/plutus.json")

if (!fs.existsSync(plutusPath)) {
  console.error(`❌ plutus.json not found at ${plutusPath}`)
  process.exit(1)
}

const plutus = JSON.parse(fs.readFileSync(plutusPath, "utf-8"))

// Find the vtokens validator. In the provided plutus.json, it's titled "vtokens_policy.vtokens.mint"
const vTokensValidator = plutus.validators.find(
  v => v.title === "vtokens_policy.vtokens.mint"
)

if (!vTokensValidator) {
  console.error("❌ vTokens validator not found in plutus.json")
  process.exit(1)
}

const policyId = vTokensValidator.hash
const tokenName = "vUSDCx"
const tokenNameHex = Buffer.from(tokenName, "utf-8").toString("hex")
const assetId = policyId + tokenNameHex

// Mint 1,000,000 vUSDCx (with 6 decimals = 1.000000 display)
const mintAmount = "1000000"

const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider })

async function main() {
  console.log("🚀 Initializing Minting for vUSDCx on Preprod...")
  
  const address = await wallet.getChangeAddress()
  const utxos = await wallet.getUtxos()
  
  if (utxos.length === 0) {
    console.error("❌ No UTxOs found in wallet. Please fund the wallet with tADA.")
    process.exit(1)
  }

  console.log(`📡 Connected Wallet: ${address}`)
  console.log(`🔨 Minting ${mintAmount} units of ${tokenName} (${tokenNameHex})...`)

  try {
    await txBuilder
      .mint(mintAmount, policyId, tokenNameHex)
      .mintingScript(vTokensValidator.compiledCode)
      .mintRedeemer({ 
        alternative: 0,
        fields: []
      }) // Always provide a redeemer for plutus scripts
      .changeAddress(address)
      .selectUtxosFrom(utxos)
      .complete()

    const signed = await wallet.signTx(txBuilder.txHex)
    const txHash = await wallet.submitTx(signed)

    console.log("✅ Successfully Minted vUSDCx")
    console.log("TX Hash:", txHash)
    console.log("Policy ID:", policyId)
    console.log("Asset ID:", assetId)
    console.log("Explorer:", `https://preprod.cardanoscan.io/transaction/${txHash}`)

    // Save to file
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

    fs.writeFileSync(
      path.join(__dirname, "deployed-assets.json"), 
      JSON.stringify(deployedAssets, null, 2)
    )
    console.log("📝 Saved asset details to scripts/deployed-assets.json")

  } catch (error) {
    console.error("❌ Minting failed:", error)
  }
}

main()
