import { useWallet, useAddress, useLovelace, useNetwork } from "@meshsdk/react";

export function useObolusWallet() {
  const { connected, connecting, connect, disconnect } = useWallet();
  const address = useAddress();
  const lovelace = useLovelace();
  const networkId = useNetwork();

  const balance = lovelace ? (parseInt(lovelace) / 1_000_000).toFixed(2) : "0";

  const truncateAddress = (addr: string | undefined) =>
    addr ? addr.slice(0, 12) + "..." + addr.slice(-6) : "";

  return {
    connected,
    connecting,
    address: address || "",
    truncatedAddress: truncateAddress(address),
    balance,
    networkId: networkId ?? null,
    isTestnet: networkId === 0,
    connect,
    disconnect,
  };
}
