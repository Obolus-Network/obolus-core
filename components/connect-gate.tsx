"use client"

import type React from "react"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"
import { usePrivy } from "@privy-io/react-auth"

export function ConnectGate({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy()

  if (!ready) {
    return (
      <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-t-2 border-primary animate-spin" />
          <span className="text-[10px] text-primary uppercase font-bold tracking-[0.3em] animate-pulse">Establishing_Secure_Link...</span>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
        <div className="glass-card rounded-lg border border-white/10 p-8 w-full max-w-sm flex flex-col items-center shadow-2xl">
          <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-6">
            <ConnectWalletButton />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white mb-2">AUTH_REQUIRED</h1>
          <p className="text-[10px] text-white/50 uppercase tracking-[0.1em] leading-relaxed max-w-[200px]">
            Please establish a link with Obolus to access the cross-chain liquidity portal.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

