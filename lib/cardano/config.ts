export const CARDANO_CONFIG = {
  network: "preprod" as const,
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
      policyId: "540321fe0b02a776e0ea96413d2dba6368b7709c03de9b1f7cbe8e69",
      tokenNameHex: "765553444378", // Buffer.from("vUSDCx").toString("hex")
      assetId: "540321fe0b02a776e0ea96413d2dba6368b7709c03de9b1f7cbe8e69765553444378",
      decimals: 6,
    }
  }
}
