# PayEase [Obolus Protocol // Cross-Chain Credit]

## 🛰️ Project Overview

**PayEase** is a next-generation decentralized credit system powered by the **Obolus Protocol**. It enables users to bridge liquidity from EVM networks (like Ethereum Sepolia) to the **Creditcoin USC Hub**, unlocking global credit limits.

Additionally, PayEase serves as a **Universal Web3 Payment Gateway**, allowing merchants on platforms like Shopify to accept crypto payments settled directly on the Creditcoin Network.

---

## ⚡ Key Features

-   **Shopify Integration**: Seamless "Pay with Obolus" extension for millions of merchants.
-   **Cross-Chain Equity Sync**: Deposit USDC/USDT on Sepolia and sync to Creditcoin USC Hub.
-   **Dynamic Credit Scoring**: Credit limits based on cross-chain equity.
-   **ZK-Proof Verification**: Secure validation via Gluwa Prover API.
-   **Real-Time Bridge Monitor**: Track attestations and Merkle Proofs.

---

## 🏗️ Technical Architecture

### 1. The Dual-Chain Mirroring System (Bridge)
PayEase operates on a **Master-Spoke** architecture to maximize security and liquidity.

```mermaid
graph TD
    User((User))
    Vault[Liquidity Vault (Sepolia)]
    Proof[Merkle Proof]
    Hub[Master Hub (USC)]
    
    User -->|Deposit| Vault
    Vault -->|Generate| Proof
    Proof -->|Sync| Hub
    Hub -->|Unlock| Credit
```

### 2. Payment Gateway Flow (Shopify)
We utilize a secure **Offsite Redirect Pattern** to handle payments.

1.  **Checkout**: User selects Obolus on Shopify.
2.  **Redirect**: User is redirected to `payease.com/pay/[secure-hash]`.
3.  **Payment**: User connects wallet and pays via Creditcoin smart contracts.
4.  **Settlement**: Funds are routed to the Merchant's On-Chain Escrow.
5.  **Completion**: User is returned to Shopify with a success confirmation.

---

## 🛠️ Installation & Setup

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd PayEase
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_id
```

### 3. Initialize Database
Run the migrations located in `./migrations/migrate.sql` and `./supabase_schema_payease.sql` in your Supabase SQL editor.

### 4. Run Development
```bash
npm run dev
```

---

## 🔐 Security & Verification
-   **Non-Custodial**: Merchants maintain full control of their settlement addresses.
-   **Merkle Proofs**: Every credit increase is backed by on-chain proof.
-   **Decentralized Attestation**: Bridge security handled by Creditcoin validators.

---

**Built with 🔥 for the Creditcoin Ecosystem** | **Powered by Obolus Protocol** | **Verified by Gluwa Prover**