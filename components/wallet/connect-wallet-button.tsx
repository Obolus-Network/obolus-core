"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"

export function ConnectWalletButton() {
  const { login, logout, authenticated, user } = usePrivy()

  const address = user?.wallet?.address

  return (
    <Button
      onClick={authenticated ? logout : login}
      className="bg-[#b1ef4a] hover:bg-[#b1ef4a]/90 text-black rounded-full"
    >
      {authenticated && address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  )
}

