"use client";

import { useWalletList } from "@meshsdk/react";
import { Button } from "@/components/ui/button";
import { useObolusWallet } from "@/lib/hooks/useObolusWallet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ShieldAlert, Copy } from "lucide-react";
import { toast } from "react-toastify";

export function ConnectWalletButton() {
  const { connected, address, truncatedAddress, balance, networkId, connect, disconnect } = useObolusWallet();
  const wallets = useWalletList();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  const isWrongNetwork = networkId !== 0; // 0 for Preprod

  if (!connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-primary/10 border-primary/20 text-primary font-mono text-[10px] tracking-widest uppercase hover:bg-primary/20 rounded-sm px-4"
          >
            CONNECT_WALLET
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white font-mono w-[220px] p-1 shadow-2xl">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Select_Wallet</span>
          </div>
          {wallets.length > 0 ? (
            wallets.map((w) => (
              <DropdownMenuItem
                key={w.name}
                onClick={() => connect(w.name, true)}
                className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-white/5 focus:bg-primary/10 text-[10px] uppercase font-bold tracking-tighter group"
              >
                <div className="flex items-center gap-3">
                  <img src={w.icon} alt={w.name} className="size-4 grayscale group-hover:grayscale-0 transition-all" />
                  {w.name}
                </div>
                <div className="size-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-[8px] text-white/40 text-center uppercase leading-loose">
              No Browser Wallets Detected<br/>
              <span className="text-primary/60">[Install Nami / Eternl / Lace]</span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-end gap-1 cursor-pointer group">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-sm font-mono text-[10px] font-black tracking-tight transition-all active:scale-95 shadow-[0_0_15px_rgba(166,242,74,0.2)]">
            <span className="size-1.5 bg-primary-foreground rounded-full animate-pulse" />
            {truncatedAddress}
          </div>
          {isWrongNetwork && (
            <span className="text-[7px] text-amber-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
              <ShieldAlert className="size-2" />
              WRONG_NETWORK // SWITCH_TO_PREPROD
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white font-mono min-w-[280px] p-0 overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-4 py-4 border-b border-white/10 flex flex-col gap-2 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={copyAddress} className="text-white/20 hover:text-primary transition-colors">
                    <Copy className="size-3" />
                </button>
            </div>
          <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Active_Session</span>
          <span className="text-[10px] font-bold break-all text-primary/80 pr-6">{address}</span>
        </div>
        
        <div className="p-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 p-2 rounded-sm border border-white/5">
                <span className="text-[7px] text-white/30 uppercase block mb-1">Balance</span>
                <span className="text-xs font-bold text-white">{balance} ₳</span>
            </div>
            <div className="bg-white/5 p-2 rounded-sm border border-white/5">
                <span className="text-[7px] text-white/30 uppercase block mb-1">Network</span>
                <span className={`text-[9px] font-black ${networkId === 0 ? "text-primary" : "text-amber-400"}`}>
                    {networkId === 0 ? "PREPROD" : "MAINNET"}
                </span>
            </div>
          </div>

          <DropdownMenuItem
            onClick={() => disconnect()}
            className="flex items-center justify-center gap-2 py-3 px-3 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 text-[10px] uppercase font-black tracking-widest transition-all mt-2"
          >
            <LogOut className="size-3" />
            TERMINATE_SESSION
          </DropdownMenuItem>
        </div>
        <div className="bg-white/5 px-4 py-2 border-t border-white/10">
            <span className="text-[7px] text-white/20 uppercase tracking-widest">Obolus_Terminal_Secure_Link_v1.2</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
