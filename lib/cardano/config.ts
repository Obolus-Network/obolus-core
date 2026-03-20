export const CARDANO_CONFIG = {
  network: "preprod",
  blockfrostUrl: "https://cardano-preprod.blockfrost.io/api/v0",
  blockfrostKey: process.env.NEXT_PUBLIC_BLOCKFROST_KEY!,
  
  contracts: {
    vaultCore: "addr_test1wrfpdu6cpgfmyjd93z89j32avzzxvdnfkfs77zf0zl74wyck5cz93",
    vtokensPolicy: "addr_test1wpkj6s3492gzvvx7x7xrhueg4thke2wqj2dak0zuggc6fyquc0cwr",
    creditEngine: "addr_test1wrmmdhz2kq0mnkuk9ggqzlvrs8rxk4skvgtg7enf7ze3x5sp6uwlq",
    yieldRouter: "addr_test1wz9jlf9gnmvyt5gasx2svwz90auyyeatetvuke5ej6sjtsgamssl8",
  },
  
  assets: {
    vUSDCx: {
      policyId: "6d2d42352a902630de378c3bf328aaef6ca9c0929bdb3c5c4231a490", // vtokens_policy.hash from plutus.json
      tokenName: "76555344437800",
      decimals: 6,
    }
  },
  
  // Testnet: deposit tADA, receive vUSDCx
  depositAsset: "lovelace",
  receiptToken: "vUSDCx",
}
