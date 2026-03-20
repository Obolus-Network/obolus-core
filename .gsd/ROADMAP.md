# ROADMAP: Cardano Migration

**Status:** IN_PROGRESS
**Start Date:** 2026-03-21

## Phase 1: Removal of Legacy EVM "Shit"
- Task 1: Identify and Remove dependencies (`ethers`, `viem`, `wagmi`, `compound-js`) in both projects.
- Task 2: Clean up legacy contract ABIs, constants, and EVM-specific configurations.
- Task 3: Refactor the Faucet and UI components that refer to Ethereum, Monad, and Creditcoin.

## Phase 2: Cardano Wallet & Script Integration
- Task 1: Initialize MeshJS Provider in `layout.tsx` across both projects.
- Task 2: Update `ConnectWalletButton` and `ConnectGate` to use MeshJS native hooks.
- Task 3: Update `contracts.ts` with Cardano-specific script addresses and policy IDs.

## Phase 3: Checkout & Developer Flow
- Task 1: Replace EVM-based checkout in `obolus-developers` with Cardano UTxO-based payments.
- Task 2: Implement Cardano-specific transaction building for "Ecosystem" view.
- Task 3: Final verification and theme polish.

## Phase 4: Aiken Smart Contract Implementation (Optional/Advanced)
- Task 1: Port critical EVM logic to Aiken validators.
- Task 2: Deploy and integrate Aiken scripts.
