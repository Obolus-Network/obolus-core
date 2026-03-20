"use client"

import { useState } from "react"
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
    Lock
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useObolusWallet } from "@/lib/hooks/useObolusWallet"
import { useVaultData } from "@/lib/minswap/useVaultData"
import { toast } from "react-toastify"

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
    const { connected } = useObolusWallet()
    const { vaults, totalTVL, avgAPY, isLoading, lastUpdated } = useVaultData()

    const filteredVaults = filter === "ALL_VAULTS"
        ? vaults
        : vaults.filter(v => v.category === filter || v.type.includes(filter.replace("_VAULTS", "")))

    const handleAction = (type: string) => {
        if (!connected) {
            toast.info("Please connect your wallet first.")
            return
        }
        toast.success(`COMING_SOON // ${type} integration in progress`)
    }

    return (
        <div className="flex-1 flex flex-col py-8 gap-6 w-full font-mono text-white">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.4em] text-primary/60 uppercase">Yield_Engine // Vault_Management</span>
                <h1 className="text-white text-xl tracking-tighter font-bold uppercase">VAULTS_TERMINAL_V1.0</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Auto-compounding yield vaults. Deposit assets, earn yield, unlock credit.</p>
            </div>

            {/* Stats Bar */}
            <div className="glass-card rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center text-white">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Protocol_Metrics</span>
                    <span className="text-primary text-[10px] flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 bg-primary rounded-full ${isLoading ? "animate-pulse" : ""}`} />
                        {isLoading ? "SYNCING..." : "SYSTEM_READY"}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-white">
                    <div className="p-4 sm:p-6 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">Total_Vault_TVL</span>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24 bg-white/5" />
                            ) : (
                                <span className="text-white text-2xl font-bold tracking-tighter">{formatUSD(totalTVL)}</span>
                            )}
                            <Badge variant="outline" className={`text-[8px] ${isLoading ? "bg-white/5 text-white/20 border-white/10" : "bg-primary/10 text-primary border-primary/20"}`}>
                                {isLoading ? "SYNCING" : "LIVE"}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">Average_Vault_APY</span>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
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
                        <span className="text-[10px] text-primary/60 tracking-wider uppercase">Your_Deposits</span>
                        <div className="flex items-center gap-2">
                            <span className="text-primary text-2xl font-bold tracking-tighter">$0.00</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary text-[8px] border-primary/20">WALLET</Badge>
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
                                    {vault.dataSource === "live" ? "Live_Yield_APR" : "Expected_APY"}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    {isLoading ? (
                                        <Skeleton className="h-10 w-24 bg-white/5" />
                                    ) : (
                                        <>
                                            <span className={`text-3xl font-black tracking-tighter ${vault.dataSource === "live" ? "text-primary" : "text-amber-400"}`}>
                                                {(vault.liveAPY || vault.targetAPY).toFixed(2)}%
                                            </span>
                                            {vault.dataSource !== "live" && (
                                                <span className="text-[8px] text-amber-500/60 font-black border border-amber-500/20 px-1 rounded-sm">EST</span>
                                            )}
                                        </>
                                    )}
                                    <TrendingUp className="size-4 text-primary opacity-50" />
                                </div>
                                <span className="text-[9px] text-white/20 uppercase tracking-tighter">
                                    Daily: {((vault.liveAPY || vault.targetAPY) / 365).toFixed(3)}%
                                </span>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Total_TVL</span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-16 bg-white/5" />
                                    ) : (
                                        <span className="text-xs font-bold text-white/80">{formatUSD(vault.liveTVL || 0)}</span>
                                    )}
                                    {vault.volume24h !== undefined && vault.volume24h > 0 && (
                                        <span className="text-[7px] text-white/20 uppercase mt-1">VOL_24H: {formatUSD(vault.volume24h)}</span>
                                    )}
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Your_Deposit</span>
                                    <span className="text-xs font-bold text-primary">$0</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[10px] text-white/40 leading-relaxed min-h-[30px]">
                                {vault.description}
                            </p>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => handleAction("DEPOSIT")}
                                    className="bg-primary hover:bg-primary/80 text-primary-foreground py-2.5 rounded-sm font-black text-[10px] uppercase transition-all active:scale-95"
                                >
                                    Deposit
                                </button>
                                <button 
                                    onClick={() => handleAction("WITHDRAW")}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white py-2.5 rounded-sm font-bold text-[10px] uppercase transition-all active:scale-95"
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Credit Banner */}
            <div className="mt-8 glass-card rounded-lg border border-primary/20 overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all" />
                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="size-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <ShieldCheck className="size-8 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-primary tracking-[0.2em] uppercase">Credit_Available</span>
                            <p className="text-sm text-white/80 max-w-xl leading-relaxed">
                                Deposit into any vault to unlock your <span className="text-primary font-bold">USDCx credit line</span>. 
                                Vault receipt tokens (vTokens) are accepted as collateral. Yield auto-services your debt.
                            </p>
                        </div>
                    </div>
                    <Link href="/pools" className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(166,242,74,0.3)] text-center">
                        View Credit Terminal
                    </Link>
                </div>
            </div>

            {/* Status Footer */}
            <div className="mt-auto pt-12">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6 text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase">
                    <div className="flex items-center gap-4">
                        <span className="text-primary/60 flex items-center gap-1.5">
                            <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                            DATA_SYNC: {lastUpdated ? lastUpdated.toLocaleTimeString() : "PENDING"} // SOURCE: MINSWAP_API
                        </span>
                        <span>SYSTEM_LATENCY: 14ms</span>
                        <span>ENGINE_STATUS: STABLE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Obolus_NETWORK: ONLINE</span>
                        <span className="text-primary/40">TERMINAL_SESSION_ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
