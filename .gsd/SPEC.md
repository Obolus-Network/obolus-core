# SPEC: Obolus Pay - Cardano Migration

**Status:** FINALIZED
**Version:** 1.0.1
**Date:** 2026-03-21

## 1. Objective
Transform Obolus Pay and Obolus Developers from an EVM-centric (Ethereum, Monad, Creditcoin) architecture to a pure Cardano native architecture. This involves removing all legacy EVM code, dependencies, and configurations, and replacing them with MeshJS-based Cardano implementations.

## 2. Requirements

### 2.1 Remove Legacy EVM/EVM-Equivalent "Shit"
- Remove `ethers`, `viem`, `wagmi`, and `@compound-finance/compound-js` dependencies.
- Remove `contracts.ts` and ABIs related to Ethereum, Monad, Sepolia, and Creditcoin (USC).
- Clean up any UI components referring to these networks (e.g., Faucet page, Network selectors).
- Remove `hardhat` and EVM-specific deployment scripts in `obolus-developers`.

### 2.2 Add Cardano Implementation
- Standardize on **MeshJS** (`@meshsdk/core`, `@meshsdk/react`) for wallet connection and transaction building.
- Implement Cardano-native wallet connection throughout the app.
- Update `contracts.ts` (or equivalent) to use Cardano script addresses and policy IDs.
- Update `obolus-developers` to handle Cardano-specific checkout logic (UTxO-based).

### 2.3 Visual & Theme Consistency
- Maintain the "Neon Lime" aesthetic throughout the migration.
- Ensure Cardano-specific UI elements (like wallet address formatting) match the terminal theme.

## 3. Scope
- `obolus-pay/`: Main application frontend and logic.
- `obolus-developers/`: Checkout application and backend-lite.
- `cardano-agent-skills/`: Reference for implementation patterns.

## 4. Technical Constraints
- No more EVM-based smart contracts.
- Use **Aiken** if custom smart contracts are needed (reference `aiken-smart-contracts` skill).
- Use **Blockfrost** or similar as the Cardano provider (configurable).
- All work must be completed within the existing Next.js framework.
