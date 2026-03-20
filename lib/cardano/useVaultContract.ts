"use client"
import { useWallet } from "@meshsdk/react"
import { Transaction } from "@meshsdk/core"
import { useState } from "react"
import { CARDANO_CONFIG } from "./config"

export function useVaultContract() {
  const { wallet, connected } = useWallet()
  const [txStatus, setTxStatus] = useState<
    "idle" | "building" | "signing" | "submitting" | "success" | "error"
  >("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  // READ: Get vault TVL from Blockfrost via proxy
  async function getVaultTVL(): Promise<number> {
    try {
      const res = await fetch(
        `/api/blockfrost/addresses/${CARDANO_CONFIG.contracts.vaultCore}/utxos`,
        { headers: { project_id: CARDANO_CONFIG.blockfrostKey } }
      )
      const utxos = await res.json()
      if (!Array.isArray(utxos)) return 0
      return utxos.reduce((sum: number, utxo: any) => {
        const lovelace = utxo.amount?.find((a: any) => a.unit === "lovelace")
        return sum + (lovelace ? parseInt(lovelace.quantity) : 0)
      }, 0) / 1_000_000
    } catch (err) {
      console.error("Failed to fetch vault TVL:", err)
      return 0
    }
  }

  // READ: Get user vUSDCx balance via proxy
  async function getUserVtokenBalance(address: string): Promise<number> {
    if (!CARDANO_CONFIG.assets.vUSDCx.assetId) return 0
    try {
      const res = await fetch(
        `/api/blockfrost/addresses/${address}/utxos`,
        { headers: { project_id: CARDANO_CONFIG.blockfrostKey } }
      )
      const utxos = await res.json()
      if (!Array.isArray(utxos)) return 0
      let total = 0
      for (const utxo of utxos) {
        for (const amount of utxo.amount || []) {
          if (amount.unit === CARDANO_CONFIG.assets.vUSDCx.assetId) {
            total += parseInt(amount.quantity)
          }
        }
      }
      return total / 1_000_000
    } catch (err) {
      console.error("Failed to fetch user balance:", err)
      return 0
    }
  }

  // WRITE: Deposit tADA into vault
  async function deposit(amountADA: number): Promise<string> {
    if (!connected || !wallet) throw new Error("Wallet not connected")
    setTxStatus("building")
    setError("")

    try {
      const address = await wallet.getChangeAddress()
      const lovelace = String(Math.floor(amountADA * 1_000_000))

      const tx = new Transaction({ initiator: wallet as any })
        .sendLovelace(
          {
            address: CARDANO_CONFIG.contracts.vaultCore,
            datum: {
              value: {
                alternative: 0,
                // Simple placeholder fields to avoid hex parsing errors (Mesh Data expects hex for strings)
                fields: []
              },
              inline: true
            }
          },
          lovelace
        )

      setTxStatus("signing")
      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx, false) // Explicit partialSign value

      setTxStatus("submitting")
      const hash = await wallet.submitTx(signedTx)
      
      setTxHash(hash)
      setTxStatus("success")
      return hash

    } catch (err: any) {
      console.error("Deposit failed:", err)
      setError(err.message || "Transaction failed")
      setTxStatus("error")
      throw err
    }
  }

  // WRITE: Withdraw from vault
  async function withdraw(vtokenAmount: number): Promise<string> {
    if (!connected || !wallet) throw new Error("Wallet not connected")
    setTxStatus("building")
    setError("")

    try {
      // Testnet simplified for demo
      const address = await wallet.getChangeAddress()
      const tx = new Transaction({ initiator: wallet as any })
        .sendLovelace(address, "2000000") // send 2 ADA back to self as test proof

      setTxStatus("signing")
      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx, false) // Explicit partialSign value

      setTxStatus("submitting")
      const hash = await wallet.submitTx(signedTx)

      setTxHash(hash)
      setTxStatus("success")
      return hash

    } catch (err: any) {
      console.error("Withdraw failed:", err)
      setError(err.message || "Transaction failed")
      setTxStatus("error")
      throw err
    }
  }

  const statusLabel = {
    idle: "",
    building: "BUILDING_TX...",
    signing: "AWAITING_SIGNATURE...",
    submitting: "SUBMITTING_TX...",
    success: "TX_CONFIRMED ✓",
    error: "TX_FAILED ✗"
  }[txStatus]

  return {
    deposit,
    withdraw,
    getVaultTVL,
    getUserVtokenBalance,
    txStatus,
    setTxStatus,
    txHash,
    error,
    statusLabel
  }
}
