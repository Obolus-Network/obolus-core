"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Zap,
    RefreshCw,
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    ShieldCheck,
    Coins,
    Lock,
    X,
    Loader2,
    CheckCircle2,
    ExternalLink,
    Terminal
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useObolusWallet } from "@/lib/hooks/useObolusWallet"
import { useVaultData } from "@/lib/minswap/useVaultData"
import { toast } from "react-toastify"
import { useVaultContract } from "@/lib/cardano/useVaultContract"

/**
 * Format large USD values
 */
function formatUSD(value: number): string {
    if (value === 0) return "$—"
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
    return `$${value.toLocaleString()}`
}

export default function VaultsPage() {
    const [filter, setFilter] = useState("ALL_VAULTS")
    const { connected, address, balance } = useObolusWallet()
    const { vaults, totalTVL: minswapTVL, avgAPY, isLoading: isMinswapLoading, lastUpdated } = useVaultData()
    const { 
        deposit, 
        withdraw, 
        getVaultTVL, 
        getUserVtokenBalance, 
        txStatus, 
        setTxStatus,
        txHash, 
        error, 
        statusLabel,
        getExchangeRate
    } = useVaultContract()
    
    // On-chain state
    const [vaultTVL, setVaultTVL] = useState<number | null>(null)
    const [userVtokenBalance, setUserVtokenBalance] = useState<number>(0)
    const [exchangeRate, setExchangeRate] = useState<number>(1.0)
    const [isContractLoading, setIsContractLoading] = useState(true)

    // Modal States
    const [activeModal, setActiveModal] = useState<"DEPOSIT" | "WITHDRAW" | null>(null)
    const [selectedVault, setSelectedVault] = useState<any>(null)
    const [amount, setAmount] = useState("")

    const refreshOnChainData = async () => {
        setIsContractLoading(true)
        const tvl = await getVaultTVL()
        const rate = await getExchangeRate()
        setVaultTVL(tvl)
        setExchangeRate(rate)
        if (connected && address) {
            const vBalance = await getUserVtokenBalance(address)
            setUserVtokenBalance(vBalance)
        }
        setIsContractLoading(false)
    }

    useEffect(() => {
        refreshOnChainData()
    }, [connected, address, txHash])

    const filteredVaults = filter === "ALL_VAULTS"
        ? vaults
        : vaults.filter(v => v.category === filter || v.type.includes(filter.replace("_VAULTS", "")))

    const openModal = (type: "DEPOSIT" | "WITHDRAW", vault: any) => {
        if (!connected) {
            toast.info("Please connect your wallet first.")
            return
        }
        setSelectedVault(vault)
        setActiveModal(type)
        setAmount("")
        setTxStatus("idle")
    }

    const handleTransaction = async () => {
        if (!amount || parseFloat(amount) <= 0) return

        try {
            if (activeModal === "DEPOSIT") {
                await deposit(parseFloat(amount))
            } else {
                await withdraw(parseFloat(amount))
            }
        } catch (error: any) {
            console.error("Action failed:", error)
            toast.error(error.message || "Action failed")
        }
    }

    return (
        <div className="flex-1 flex flex-col py-8 gap-6 w-full font-mono text-white relative">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.4em] text-primary/60 uppercase">Yield_Engine // Vault_Management</span>
                <h1 className="text-white text-xl tracking-tighter font-bold uppercase flex items-center gap-2">
                    <Terminal className="size-5 text-primary" />
                    VAULTS_TERMINAL_V1.1
                </h1>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Auto-compounding yield vaults on Cardano Preprod. earn yield, unlock credit.</p>
            </div>

            {/* Stats Bar */}
            <div className="glass-card rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center text-white">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Protocol_Metrics</span>
                    <span className="text-primary text-[10px] flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 bg-primary rounded-full ${(isMinswapLoading || isContractLoading) ? "animate-pulse" : ""}`} />
                        {(isMinswapLoading || isContractLoading) ? "SYNCING..." : "SYSTEM_READY"}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-white">
                    <div className="p-4 sm:p-6 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">Vault_Core_TVL</span>
                        <div className="flex items-center gap-2">
                            {isContractLoading ? (
                                <Skeleton className="h-8 w-24 bg-white/5" />
                            ) : (
                                <span className="text-white text-2xl font-bold tracking-tighter">
                                    {vaultTVL?.toFixed(1) || "0.0"} ADA
                                </span>
                            )}
                            <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/20">PREPROD</Badge>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">Average_APY</span>
                        <div className="flex items-center gap-2">
                            {isMinswapLoading ? (
                                <Skeleton className="h-8 w-24 bg-white/5" />
                            ) : (
                                <span className="text-white text-2xl font-bold tracking-tighter">{avgAPY.toFixed(2)}%</span>
                            )}
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 text-[8px] border-blue-500/20">STABLE</Badge>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">Active_Vaults</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-2xl font-bold tracking-tighter">{vaults.length}</span>
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 text-[8px] border-green-500/20">LIVE</Badge>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col gap-1 text-primary">
                        <span className="text-[10px] text-primary/60 tracking-wider uppercase">Your_Position</span>
                        <div className="flex items-center gap-2">
                            {isContractLoading ? (
                                <Skeleton className="h-8 w-24 bg-white/5" />
                            ) : (
                                <span className="text-primary text-2xl font-bold tracking-tighter">
                                    {(userVtokenBalance).toFixed(1)} ADA
                                </span>
                            )}
                            <Badge variant="outline" className="bg-primary/10 text-primary text-[8px] border-primary/20">vUSDCx</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["ALL_VAULTS", "STABLECOIN", "BLUE_CHIP", "LP_VAULTS"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                            filter === f
                                ? "bg-primary text-primary-foreground border border-primary"
                                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Vault Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredVaults.map((vault) => (
                    <div key={vault.vaultId} className="glass-card rounded-lg border border-white/10 overflow-hidden flex flex-col hover:border-primary/30 transition-all group">
                        <div className="p-6 flex flex-col gap-6">
                            {/* Card Top */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-full bg-${vault.color}-500/20 border border-${vault.color}-500/30 flex items-center justify-center text-[10px] font-black text-${vault.color}-400`}>
                                        {vault.name.split('/')[0].slice(0, 2)}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-white text-sm font-bold tracking-tight">{vault.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] text-white/30 font-bold uppercase tracking-wider">{vault.platform}</span>
                                            <span className="size-1 bg-white/10 rounded-full" />
                                            <span className="text-[8px] text-primary/60 font-bold uppercase tracking-wider">{vault.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* APY Section */}
                            <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-sm border border-white/5 group-hover:border-primary/20 transition-all">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest">
                                    Live_APR
                                </span>
                                <div className="flex items-baseline gap-2">
                                    {isMinswapLoading ? (
                                        <Skeleton className="h-10 w-24 bg-white/5" />
                                    ) : (
                                        <span className={`text-3xl font-black tracking-tighter text-primary`}>
                                            {(vault.liveAPY || vault.targetAPY).toFixed(2)}%
                                        </span>
                                    )}
                                    <TrendingUp className="size-4 text-primary opacity-50" />
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col relative">
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Exchange_Rate</span>
                                    {isContractLoading ? (
                                        <Skeleton className="h-4 w-32 bg-white/5" />
                                    ) : (
                                        <span className="text-xs font-bold text-primary tracking-widest">
                                            1 vUSDCx = {exchangeRate.toFixed(6)} ADA
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col relative border-t border-white/5 pt-3">
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Total_TVL</span>
                                    {isMinswapLoading ? (
                                        <Skeleton className="h-4 w-16 bg-white/5" />
                                    ) : (
                                        <span className="text-xs font-bold text-white/80">{formatUSD(vault.liveTVL || 0)}</span>
                                    )}
                                </div>
                                <div className="flex flex-col border-t border-white/5 pt-3">
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Your_Deposit</span>
                                    {isContractLoading ? (
                                        <Skeleton className="h-4 w-16 bg-white/5" />
                                    ) : (
                                        connected ? (
                                            userVtokenBalance > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-primary">YOUR_DEPOSIT: {userVtokenBalance.toFixed(2)} ADA</span>
                                                    <span className="text-[10px] text-white/60">vUSDCx: {userVtokenBalance.toFixed(6)}</span>
                                                    <span className="text-[10px] text-primary/60">CREDIT_AVAIL: {(userVtokenBalance * 0.6).toFixed(2)} ADA</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">YOUR_DEPOSIT: —</span>
                                            )
                                        ) : (
                                            <span className="text-xs font-bold text-white/20">CONNECT_WALLET</span>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => openModal("DEPOSIT", vault)}
                                        className="bg-primary hover:bg-primary/80 text-primary-foreground py-2.5 rounded-sm font-black text-[10px] uppercase transition-all active:scale-95 shadow-[0_4px_0_rgb(130,190,50)] active:translate-y-[2px] active:shadow-none"
                                    >
                                        Deposit
                                    </button>
                                    <button 
                                        onClick={() => openModal("WITHDRAW", vault)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white py-2.5 rounded-sm font-bold text-[10px] uppercase transition-all active:scale-95 active:translate-y-[2px]"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                                {connected && userVtokenBalance > 0 && (
                                    <Link 
                                        href="/credit"
                                        className="w-full text-center text-primary/80 hover:text-primary border border-primary/20 bg-primary/10 hover:bg-primary/20 py-2.5 rounded-sm font-black text-[10px] uppercase transition-all"
                                    >
                                        [GET CREDIT →]
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {activeModal && selectedVault && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="glass-card w-full max-w-lg border-2 border-primary/30 shadow-[0_0_80px_rgba(166,242,74,0.1)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 font-mono">
                        {/* Modal Header */}
                        <div className="bg-primary text-black px-6 py-4 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="font-black text-[10px] tracking-widest uppercase">{activeModal}_TERMINAL // V1.1</span>
                                <h2 className="font-bold text-lg tracking-tighter uppercase">{selectedVault.name.replace('Vault', 'Pool')}</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="hover:scale-110 transition-transform">
                                <X className="size-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 flex flex-col gap-8">
                            {txStatus === "idle" || txStatus === "error" ? (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 gap-1 text-[11px] font-bold uppercase tracking-widest">
                                        <div className="flex justify-between py-1 px-4 bg-white/5 border-l-2 border-primary">
                                            <span className="text-white/40">Exchange Rate:</span>
                                            <span className="text-white">1 vUSDCx = {exchangeRate.toFixed(6)} ADA</span>
                                        </div>
                                        <div className="flex justify-between py-1 px-4 bg-white/5 border-l-2 border-primary">
                                            <span className="text-white/40">Your Balance:</span>
                                            <span className="text-primary">{balance} tADA</span>
                                        </div>
                                        {activeModal === "WITHDRAW" && (
                                            <div className="flex justify-between py-1 px-4 bg-white/5 border-l-2 border-primary">
                                                <span className="text-white/40">Your Position:</span>
                                                <span className="text-primary">{userVtokenBalance.toFixed(6)} vUSDCx</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Section */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                            <span>AMOUNT ({activeModal === "DEPOSIT" ? "tADA" : "vUSDCx"})</span>
                                            <button 
                                                onClick={() => setAmount(activeModal === "DEPOSIT" ? (balance || "0") : userVtokenBalance.toString())}
                                                className="text-primary hover:underline"
                                            >
                                                [MAX_FUNDS]
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.000000"
                                                className="w-full bg-black border-2 border-white/10 rounded-none px-6 py-6 text-3xl font-black text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all font-mono"
                                            />
                                            <div className="absolute inset-0 border border-primary/20 pointer-events-none group-focus-within:border-primary/40 -m-1" />
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="bg-black border border-primary/20 p-6 flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                            <span className="text-white/40">YOU {activeModal === "DEPOSIT" ? "DEPOSIT" : "RETURN"}:</span>
                                            <span className="text-white">{parseFloat(amount || "0").toFixed(6)} {activeModal === "DEPOSIT" ? "ADA" : "vUSDCx"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                            <span className="text-white/40">YOU RECEIVE:</span>
                                            <span className="text-primary">
                                                {activeModal === "DEPOSIT"
                                                    ? (parseFloat(amount || "0") / exchangeRate).toFixed(6)
                                                    : (parseFloat(amount || "0") * exchangeRate).toFixed(6)}
                                                {" "}
                                                {activeModal === "DEPOSIT" ? "vUSDCx" : "ADA"}
                                            </span>
                                        </div>
                                        {activeModal === "DEPOSIT" && (
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-3 mt-1">
                                                <span className="text-primary/60">CREDIT LINE:</span>
                                                <span className="text-primary">{(parseFloat(amount || "0") * 0.6).toFixed(6)} ADA (60%)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Warning */}
                                    <div className="text-[10px] text-amber-500/80 text-center font-bold uppercase tracking-widest animate-pulse">
                                        ⚠ PREPROD_TESTNET // Test ADA only
                                    </div>

                                    {/* Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={handleTransaction}
                                            disabled={!amount || parseFloat(amount) <= 0}
                                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-black py-5 rounded-none text-xs uppercase tracking-widest transition-all shadow-[0_8px_0_rgb(130,190,50)] active:translate-y-[4px] active:shadow-none"
                                        >
                                            [CONFIRM_{activeModal}]
                                        </button>
                                        <button 
                                            onClick={() => setActiveModal(null)}
                                            className="bg-white/5 hover:bg-white/10 text-white/60 font-bold py-5 rounded-none text-xs uppercase tracking-widest transition-all border border-white/10"
                                        >
                                            [CANCEL]
                                        </button>
                                    </div>
                                    
                                    {error && <div className="text-red-500 text-[10px] font-bold text-center uppercase border border-red-500/20 p-2 bg-red-500/5">{error}</div>}
                                </>
                            ) : txStatus === "success" ? (
                                <div className="py-12 flex flex-col items-center gap-8 text-center animate-in slide-in-from-bottom duration-500">
                                    <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary shadow-[0_0_40px_rgba(166,242,74,0.4)]">
                                        <CheckCircle2 className="size-14 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-white text-3xl font-black tracking-tighter uppercase">TX_CONFIRMED ✓</h3>
                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest bg-white/5 py-2 px-6 border border-white/10 break-all">
                                            HASH: {txHash.slice(0, 16)}...{txHash.slice(-8)}
                                        </p>
                                    </div>
                                    <div className="w-full flex flex-col gap-4">
                                        <Link 
                                            href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                                            target="_blank"
                                            className="bg-primary hover:bg-primary/90 text-black text-xs font-black flex items-center justify-center gap-3 py-5 rounded-none uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(130,190,50)] active:translate-y-[2px] active:shadow-none"
                                        >
                                            View on CardanoScan <ExternalLink className="size-4" />
                                        </Link>
                                        <button 
                                            onClick={() => setActiveModal(null)}
                                            className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] py-2"
                                        >
                                            [RETURN_TO_TERMINAL]
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center gap-8 text-center">
                                    <div className="relative">
                                        <Loader2 className="size-20 text-primary animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Terminal className="size-6 text-primary/40" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <span className="text-primary font-black text-sm tracking-[0.4em] uppercase animate-pulse">
                                            {statusLabel}
                                        </span>
                                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Processing Transaction on Cardano Preprod</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Decoration */}
                        <div className="h-1.5 w-full bg-primary flex overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="flex-1 bg-black/20 border-r border-black/10" />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
