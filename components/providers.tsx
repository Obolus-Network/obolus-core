"use client"

import type React from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ConvexClientProvider } from "./convex-client-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmkr3rc4i00iujs0cgnug0qzj"}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          }
        },
        defaultChain: {
          id: 102036,
          name: "Creditcoin USC Testnet 2",
          network: "usc-testnet-2",
          nativeCurrency: {
            name: "tCTC",
            symbol: "tCTC",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://rpc.usc-testnet2.creditcoin.network"],
            },
            public: {
              http: ["https://rpc.usc-testnet2.creditcoin.network"],
            },
          },
        },
        supportedChains: [
          {
            id: 102036,
            name: "Creditcoin USC Testnet 2",
            network: "usc-testnet-2",
            nativeCurrency: { name: "tCTC", symbol: "tCTC", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://rpc.usc-testnet2.creditcoin.network"] },
              public: { http: ["https://rpc.usc-testnet2.creditcoin.network"] },
            },
            blockExplorers: {
              default: { name: "Explorer", url: "https://explorer.usc-testnet2.creditcoin.network" },
            },
          },
          {
            id: 11155111,
            name: "Sepolia",
            network: "sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://api.zan.top/eth-sepolia"] },
              public: { http: ["https://api.zan.top/eth-sepolia"] },
            },
            blockExplorers: {
              default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
            },
          },
          {
            id: 84532,
            name: "Base Sepolia",
            network: "base-sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://base-sepolia-rpc.publicnode.com"] },
              public: { http: ["https://base-sepolia-rpc.publicnode.com"] },
            },
            blockExplorers: {
              default: { name: "Basescan", url: "https://sepolia.basescan.org" },
            },
          },
          {
            id: 1337,
            name: "Localnet",
            network: "localnet",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["http://127.0.0.1:7545"] },
              public: { http: ["http://127.0.0.1:7545"] },
            },
          }
        ]
      }}
    >
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </PrivyProvider>
  )
}

