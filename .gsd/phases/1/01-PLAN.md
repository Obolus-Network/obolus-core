---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Removal of Legacy EVM & Multi-Chain "Shit"

## Objective
The goal of this plan is to completely purge the `obolus-pay` and `obolus-developers` repositories of all legacy Ethereum (EVM), Monad, Creditcoin (USC), and Algorand related code, dependencies, and documentation. This is a prerequisite for a clean Cardano-native implementation.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- obolus-pay/package.json
- obolus-developers/package.json
- obolus-pay/lib/contracts.ts
- obolus-pay/scripts/quick-deploy.js

## Tasks

<task type="auto">
  <name>Uninstall Legacy JS Dependencies</name>
  <files>
    - obolus-pay/package.json
    - obolus-developers/package.json
  </files>
  <action>
    Use `npm uninstall` to remove the following packages:
    - `obolus-pay/`: `ethers`, `viem`, `wagmi`, `@compound-finance/compound-js`, `@morpho-org/blue-api-sdk`, `eth-proof`.
    - `obolus-developers/`: `ethers`, `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@privy-io/react-auth`.
    Clean up `pnpm-lock.yaml` or `package-lock.json` as well.
  </action>
  <verify>grep -E "ethers|viem|wagmi|compound-js" package.json</verify>
  <done>Zero instances of these libraries in package.json.</done>
</task>

<task type="auto">
  <name>Purge Legacy Files and Directories</name>
  <files>
    - obolus-pay/lib/abis/
    - obolus-pay/lib/algorand/
    - obolus-pay/scripts/quick-deploy.js
    - obolus-pay/SETUP_CONTRACTS.md
    - obolus-developers/hardhat.config.js
  </files>
  <action>
    1. Delete the `obolus-pay/lib/abis/` directory.
    2. Delete the `obolus-pay/lib/algorand/` directory.
    3. Delete `obolus-pay/scripts/quick-deploy.js` and remove its script entry in `package.json`.
    4. Delete `obolus-pay/SETUP_CONTRACTS.md` and any legacy documentation mentioning ALGO or ETH.
    5. Delete `obolus-developers/hardhat.config.js` and `obolus-developers/contracts/`.
  </action>
  <verify>ls obolus-pay/lib/abis obolus-pay/lib/algorand obolus-developers/hardhat.config.js</verify>
  <done>Directories and files are deleted from the filesystem.</done>
</task>

<task type="auto">
  <name>Reset Multi-Chain Configuration</name>
  <files>
    - obolus-pay/lib/contracts.ts
    - obolus-pay/app/faucet/page.tsx
  </files>
  <action>
    1. Refactor `obolus-pay/lib/contracts.ts` to remove all EVM network constants (`MONAD`, `SEPOLIA`, `CRONOS`, `GANACHE`, `USC`).
    2. Keep only a placeholder for Cardano `MAINNET` and `PREPROD`.
    3. Remove `eth-proof` and `compound-js` imports in any UI files.
    4. Update the Faucet page to remove references to "Ethereum" as the network.
  </action>
  <verify>grep -E "MONAD|SEPOLIA|CRONOS" obolus-pay/lib/contracts.ts</verify>
  <done>Config files are sanitized and ready for Cardano injection.</done>
</task>

## Success Criteria
- [ ] No more EVM-related dependencies in any `package.json`.
- [ ] No more legacy ABIs or script directories.
- [ ] The app compiles without reference errors to deleted files.
- [ ] Documentation is clean of legacy references.
