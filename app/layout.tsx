import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppHeader } from "@/components/header"
import { AppFooter } from "@/components/footer"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import { MeshProvider } from "@meshsdk/react"
import "@meshsdk/react/styles.css"

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Obolus - Crypto PayLater | Buy Now Pay Later with Cryptocurrency | Algorand DeFi",
  description: "Obolus revolutionizes crypto payments with instant buy now pay later (BNPL) solutions on Algorand blockchain. Secure, fast, and decentralized crypto lending platform for digital payments.",
  keywords: "crypto paylater, buy now pay later crypto, algorand defi, cryptocurrency lending, crypto BNPL, blockchain payments, decentralized finance, crypto loans, digital wallet, algorand dapp",
  authors: [{ name: "Obolus Team" }],
  creator: "Obolus",
  publisher: "Obolus",
  robots: "index, follow",
  icons: {
    icon: "/logo-image.png",
    apple: "/logo-image.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pay-ease-ruby.vercel.app",
    title: "Obolus - Revolutionary Crypto PayLater Platform",
    description: "Experience the future of crypto payments with Obolus. Instant buy now pay later solutions on Algorand blockchain with zero collateral requirements.",
    siteName: "Obolus",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Obolus - Crypto PayLater Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obolus - Crypto PayLater Revolution",
    description: "Buy now, pay later with cryptocurrency. Secure Algorand-based DeFi lending platform.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://pay-ease-ruby.vercel.app",
  },
  category: "Finance",
  verification: {
    google: "qunZFiuiU4IBtDRbA8VGYphVxLKloOpUIvI2R7sUZks",
  },
}


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-mono ${GeistSans.variable} ${GeistMono.variable} antialiased min-h-dvh bg-background`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>
            <MeshProvider>
              <div className="mx-auto w-full flex flex-col min-h-screen px-4 md:px-8 lg:px-12">
                <AppHeader />
                <main className="pb-24 flex-grow">{children}</main>
                <AppFooter />
              </div>
            </MeshProvider>
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
