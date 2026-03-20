import { CardanoWallet } from "@meshsdk/react";

export function ConnectWalletButton() {
  return (
    <div className="mesh-wallet-wrapper">
      <CardanoWallet persist={true} isDark={true} />
    </div>
  );
}

