import { useWallet } from "@meshsdk/react";
import { useState, useEffect } from "react";

export function useObolusWallet() {
  const { connected, wallet, connect, disconnect } = useWallet();
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [networkId, setNetworkId] = useState<number | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then(setAddress);
      wallet.getLovelace().then((l) =>
        setBalance((parseInt(l) / 1_000_000).toFixed(2))
      );
      wallet.getNetworkId().then(setNetworkId);
    }
  }, [connected, wallet]);

  const truncateAddress = (addr: string) =>
    addr ? addr.slice(0, 12) + "..." + addr.slice(-6) : "";

  return {
    connected,
    address,
    truncatedAddress: truncateAddress(address),
    balance,
    networkId,
    isTestnet: networkId === 0,
    connect,
    disconnect,
  };
}
