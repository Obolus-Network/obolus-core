/**
 * Obolus Vault Strategy Mapping
 * Maps UI vaults to real Minswap Mainnet Pool IDs
 */

export const OBOLUS_VAULT_STRATEGIES = [
  {
    vaultId: "usdcx-ada",
    name: "USDCx/ADA",
    platform: "MINSWAP",
    type: "LP VAULT",
    category: "STABLECOIN",
    description: "USDC-ADA liquidity pool. Auto-compounds MIN rewards.",
    risk: "LOW",
    // USDM/ADA pool as proxy until USDCx has its own pool
    // Pool ID: USDM-ADA V2 pool
    minswapPoolId: "6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2",
    assetA: "ADA",
    assetB: "USDM",
    targetAPY: 12.4,
    color: "blue"
  },
  {
    vaultId: "usdcx-lending",
    name: "USDCx LENDING",
    platform: "LIQWID",
    type: "LENDING",
    category: "STABLECOIN", 
    description: "Supply USDCx to Liqwid lending market. Earn borrower interest.",
    risk: "LOW",
    // No Minswap pool — use static APY for now, Liqwid integration later
    minswapPoolId: null,
    targetAPY: 8.2,
    color: "green"
  },
  {
    vaultId: "usdcx-usdm",
    name: "USDCx/USDM",
    platform: "MINSWAP",
    type: "STABLE LP",
    category: "STABLECOIN",
    description: "Stablecoin LP. Minimal impermanent loss. Auto-compounds.",
    risk: "VERY LOW",
    // USDM/USDA stable pool — best stable pool on Minswap right now
    minswapPoolId: "5f0d38b3eb8fea72cd3cbdaa9594a74d0db79b5a27e85be5e9015bd65553444d2d555344412d534c50",
    assetA: "USDM",
    assetB: "USDA",
    targetAPY: 9.8,
    color: "purple"
  },
  {
    vaultId: "ada-staking",
    name: "ADA STAKING",
    platform: "CARDANO",
    type: "SINGLE ASSET",
    category: "BLUE_CHIP",
    description: "Native ADA staking yield. No impermanent loss.",
    risk: "VERY LOW",
    minswapPoolId: null,
    targetAPY: 3.8,
    color: "orange"
  },
]
