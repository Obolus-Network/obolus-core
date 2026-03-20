"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Terminal,
    LayoutDashboard,
    Zap,
    TrendingUp,
    ShieldCheck,
    Coins,
    Lock,
    Wallet,
    Loader2,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    X
} from "lucide-react"
import { useObolusWallet } from "@/lib/hooks/useObolusWallet"
import { useVaultContract } from "@/lib/cardano/useVaultContract"
import { useCreditEngine, CreditPosition } from "@/lib/cardano/useCreditEngine"

export default function CreditPage() {
    const { connected, address } = useObolusWallet()
    const { getUserVtokenBalance } = useVaultContract()
    const { 
        openCreditLine,
        repayDebt,
        getCreditPosition,
        calculateMaxBorrow,
        calculateHealthFactor,
        calculateLTV,
        calculateDebtServiceDays,
        txStatus,
        setTxStatus,
        txHash,
        error,
        statusLabel,
        MAX_LTV_BPS,
        WARNING_BPS,
        LIQUIDATION_BPS
    } = useCreditEngine()

    const [vtokenBalance, setVtokenBalance] = useState<number>(0)
    const [position, setPosition] = useState<CreditPosition | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Form states
    const [collateralInput, setCollateralInput] = useState("")
    const [borrowInput, setBorrowInput] = useState("")

    useEffect(() => {
        async function fetchData() {
            if (!connected || !address) {
                setVtokenBalance(0)
                setPosition(null)
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const balance = await getUserVtokenBalance(address)
            setVtokenBalance(balance)

            // Try to fetch on-chain position
            let pos = await getCreditPosition(address)
            
            // For demo purposes: if we just confirmed a TX, show a mock active position immediately
            // if Blockfrost hasn't indexed the simplified datum
            const cached = localStorage.getItem(`credit_pos_${address}`)
            if (!pos && cached) {
                pos = JSON.parse(cached)
            }
            
            setPosition(pos)
            setIsLoading(false)
        }
        fetchData()
    }, [connected, address, txHash])

    const handleMaxCollateral = () => {
        setCollateralInput(vtokenBalance.toString())
    }

    const collateralAmt = parseFloat(collateralInput) || 0
    const borrowAmt = parseFloat(borrowInput) || 0
    
    // Dynamic calculations for preview
    const ltv = calculateLTV(borrowAmt, collateralAmt)
    const hf = calculateHealthFactor(collateralAmt, borrowAmt)
    const maxBorrow = calculateMaxBorrow(collateralAmt)
    const isLtvValid = ltv <= MAX_LTV_BPS && borrowAmt > 0 && collateralAmt > 0

    // Preview Debt Service (Mocking vault APY = 12.4%)
    const vaultAPY = 0.124
    const dailyYield = (collateralAmt * vaultAPY) / 365
    const dailyCost = (borrowAmt * 0.08) / 365
    const netReduction = dailyYield - dailyCost
    const daysToRepay = calculateDebtServiceDays(borrowAmt, collateralAmt, vaultAPY)

    const handleOpenCredit = async () => {
        if (!isLtvValid) return
        try {
            const hash = await openCreditLine(collateralAmt, borrowAmt)
            // Mock cache the position for immediate UI feedback post-tx in demo mode
            const mockPos: CreditPosition = {
                borrower: address,
                collateralVtokens: collateralAmt,
                borrowedAmount: borrowAmt,
                ltv,
                healthFactor: hf,
                status: "healthy",
                dailyYield,
                debtServiceDays: daysToRepay
            }
            localStorage.setItem(`credit_pos_${address}`, JSON.stringify(mockPos))
        } catch (err) {
            console.error(err)
        }
    }

    const handleClosePosition = async () => {
        if (!position) return
        try {
            await repayDebt(position.borrowedAmount)
            localStorage.removeItem(`credit_pos_${address}`)
            setPosition(null)
            setTxStatus("idle")
        } catch (err) {
            console.error(err)
        }
    }

    // Helper functions for UI
    const getLtvColor = (val: number) => {
        if (val < 5000) return "text-green-500 bg-green-500"
        if (val <= 7000) return "text-amber-500 bg-amber-500"
        return "text-red-500 bg-red-500"
    }

    const getHfColor = (val: number) => {
        if (val > 10000) return "text-green-500"
        if (val >= 7500) return "text-amber-500"
        return "text-red-500"
    }

    return (
        <div className="flex-1 flex flex-col py-8 gap-6 w-full font-mono text-white relative">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.4em] text-primary/60 uppercase">Credit_Engine // Collateral_Terminal</span>
                <h1 className="text-white text-xl tracking-tighter font-bold uppercase flex items-center gap-2">
                    <Terminal className="size-5 text-primary" />
                    CREDIT_TERMINAL_V1.0
                </h1>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Lock vUSDCx. Borrow tADA. Yield auto-repays your debt.</p>
            </div>

            {/* Protocol Stats Bar */}
            <div className="glass-card rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-white">
                    <div className="p-4 sm:p-5 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">TOTAL_BORROWED</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-xl font-bold tracking-tighter">$0</span>
                            <span className="text-primary text-[8px] uppercase border border-primary/20 bg-primary/10 px-1 py-0.5 rounded-sm">SYNCED</span>
                        </div>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">TOTAL_COLLATERAL</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-xl font-bold tracking-tighter">$0</span>
                            <span className="text-blue-400 text-[8px] uppercase border border-blue-500/20 bg-blue-500/10 px-1 py-0.5 rounded-sm">STABLE</span>
                        </div>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 tracking-wider uppercase">ACTIVE_POSITIONS</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-xl font-bold tracking-tighter">0</span>
                            <span className="text-green-400 text-[8px] uppercase border border-green-500/20 bg-green-500/10 px-1 py-0.5 rounded-sm">LIVE</span>
                        </div>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-1">
                        <span className="text-[10px] text-primary/60 tracking-wider uppercase">PROTOCOL_HEALTH</span>
                        <div className="flex items-center gap-2">
                            <span className="text-primary text-xl font-bold tracking-tighter">100%</span>
                            <span className="text-primary text-[8px] uppercase border border-primary/20 bg-primary/10 px-1 py-0.5 rounded-sm">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
                
                {/* Left Column: Flow Context / Transaction State */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Transaction Overlay Modal (if active) */}
                    {txStatus !== "idle" && (
                        <div className="glass-card border-2 border-primary/30 shadow-[0_0_80px_rgba(166,242,74,0.1)] p-8 flex flex-col gap-8 animate-in fade-in zoom-in duration-200">
                            {txStatus === "success" ? (
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
                                    <div className="w-full flex flex-col gap-4 mt-4">
                                        <Link 
                                            href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                                            target="_blank"
                                            className="bg-primary hover:bg-primary/90 text-black text-xs font-black flex items-center justify-center gap-3 py-5 rounded-none uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(130,190,50)] active:translate-y-[2px] active:shadow-none"
                                        >
                                            View on CardanoScan <ExternalLink className="size-4" />
                                        </Link>
                                        <button 
                                            onClick={() => setTxStatus("idle")}
                                            className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] py-2"
                                        >
                                            [RETURN_TO_TERMINAL]
                                        </button>
                                    </div>
                                </div>
                            ) : txStatus === "error" ? (
                                <div className="py-12 flex flex-col items-center gap-8 text-center text-red-500">
                                    <div className="size-24 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                                        <X className="size-14 text-red-500" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase">TX_FAILED ✗</h3>
                                        <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest max-w-sm">
                                            {error}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setTxStatus("idle")}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-black py-4 px-10 rounded-none uppercase tracking-widest transition-all mt-4"
                                    >
                                        [DISMISS]
                                    </button>
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
                    )}

                    {/* Show Main Position panels only if idle */}
                    {txStatus === "idle" && (
                        <>
                            {!connected ? (
                                <div className="glass-card border border-white/10 p-12 flex flex-col items-center justify-center text-center gap-4">
                                    <Wallet className="size-12 text-white/20" />
                                    <div className="text-white/40 text-sm font-bold uppercase tracking-widest">
                                        CONNECT_WALLET // To view your credit position
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className="glass-card border border-white/10 p-12 flex justify-center">
                                    <Loader2 className="size-8 text-primary/40 animate-spin" />
                                </div>
                            ) : position ? (
                                // ── ACTIVE POSITION PANEL ──
                                <div className="glass-card border border-primary/30 p-6 flex flex-col gap-6">
                                    <div className="flex justify-between items-center border-b border-primary/20 pb-4">
                                        <h2 className="text-lg font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                                            ACTIVE_POSITION
                                        </h2>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${getHfColor(position.healthFactor)}`}>
                                            ● {position.status}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white/40 uppercase tracking-widest text-[10px]">Collateral Locked</span>
                                            <span className="font-bold text-white">{position.collateralVtokens.toFixed(6)} vUSDCx</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white/40 uppercase tracking-widest text-[10px]">Borrowed</span>
                                            <span className="font-bold text-primary">{position.borrowedAmount.toFixed(2)} ADA</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white/40 uppercase tracking-widest text-[10px]">Current LTV</span>
                                            <span className="font-bold text-white">{(position.ltv / 100).toFixed(2)}%</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white/40 uppercase tracking-widest text-[10px]">Health Factor</span>
                                            <span className="font-bold text-white">{position.healthFactor} bps</span>
                                        </div>
                                    </div>

                                    {/* Yield Service Engine Preview */}
                                    <div className="border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest">YIELD_SERVICE_ENGINE:</span>
                                        <div className="grid grid-cols-2 gap-y-2 text-[10px] uppercase font-bold">
                                            <span className="text-white/40">Vault APY:</span>
                                            <span className="text-white text-right">12.40%</span>
                                            <span className="text-white/40">Daily yield:</span>
                                            <span className="text-green-400 text-right">+{position.dailyYield.toFixed(5)} ADA</span>
                                            <span className="text-white/40">Daily debt cost:</span>
                                            <span className="text-red-400 text-right">-{(position.borrowedAmount * 0.08 / 365).toFixed(5)} ADA</span>
                                            <span className="text-white/40 mt-1">Est. payoff:</span>
                                            <span className="text-primary text-right mt-1">~{position.debtServiceDays === Infinity ? "NEVER" : position.debtServiceDays} days</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[10px]">
                                            <span className="text-white/40">Progress:</span>
                                            <div className="flex-1 bg-black h-2 border border-primary/30 flex">
                                                <div className="bg-primary/50 w-[5%] h-full" />
                                            </div>
                                            <span className="text-primary">5%</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">REPAY_OPTIONS:</span>
                                        <div className="flex items-center gap-2 text-[10px] text-white/60">
                                            <CheckCircle2 className="size-3 text-primary" /> YIELD_SERVICED (auto)
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <button 
                                                onClick={handleClosePosition}
                                                className="col-span-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                [CLOSE_POSITION]
                                            </button>
                                            <p className="col-span-2 text-center text-[8px] text-white/30 uppercase tracking-widest">
                                                (Repays all debt + returns vUSDCx collateral)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : vtokenBalance > 0 ? (
                                // ── OPEN CREDIT LINE PANEL ──
                                <div className="glass-card border border-white/10 p-6 flex flex-col gap-6 relative">
                                    <div className="border-b border-white/10 pb-4">
                                        <h2 className="text-lg font-bold text-white uppercase tracking-tighter">OPEN_CREDIT_LINE</h2>
                                    </div>

                                    <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 p-3 border-l-2 border-primary">
                                        <div className="flex justify-between">
                                            <span className="text-white/40">Available Collateral:</span>
                                            <span className="text-white">{vtokenBalance.toFixed(6)} vUSDCx</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/40">Collateral Value:</span>
                                            <span className="text-white">{vtokenBalance.toFixed(2)} ADA</span>
                                        </div>
                                        <div className="flex justify-between text-primary mt-1">
                                            <span>Max Borrow (60% LTV):</span>
                                            <span>{calculateMaxBorrow(vtokenBalance).toFixed(2)} ADA</span>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white/40">COLLATERAL (vUSDCx)</span>
                                                <button onClick={handleMaxCollateral} className="text-primary hover:underline">
                                                    [MAX]
                                                </button>
                                            </div>
                                            <input 
                                                type="number"
                                                value={collateralInput}
                                                onChange={(e) => setCollateralInput(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-black border border-white/10 p-3 text-lg font-black font-mono focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white/40">BORROW AMOUNT (ADA)</span>
                                            </div>
                                            <input 
                                                type="number"
                                                value={borrowInput}
                                                onChange={(e) => setBorrowInput(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-black border border-white/10 p-3 text-lg font-black font-mono focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Card */}
                                    <div className="border border-white/10 bg-black p-4 flex flex-col gap-3 text-[10px] font-bold uppercase">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40">LTV:</span>
                                            <div className="flex items-center gap-2">
                                                <span className={getLtvColor(ltv).split(' ')[0]}>{(ltv/100).toFixed(2)}%</span>
                                                <div className="w-20 h-2 bg-white/10 flex">
                                                    <div className={`h-full ${getLtvColor(ltv).split(' ')[1]}`} style={{ width: `${Math.min(ltv/100, 100)}%` }} />
                                                </div>
                                                <span className="text-white/20">60%</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40">Health Factor:</span>
                                            <span className={getHfColor(hf)}>{hf} bps</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40">Status:</span>
                                            <span className={getHfColor(hf)}>● {hf > 10000 ? "HEALTHY" : hf > 7500 ? "WARNING" : "AT_RISK"}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-white/40">Borrow Rate:</span>
                                            <span className="text-white">8.00% APY</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40">Vault APY:</span>
                                            <span className="text-primary">12.40%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40">Net Yield:</span>
                                            <span className="text-primary">+{((vaultAPY - 0.08)*100).toFixed(2)}% after debt service</span>
                                        </div>
                                    </div>

                                    {/* Yield Preview */}
                                    <div className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-2">
                                        <span>YIELD_SERVICE_PREVIEW:</span>
                                        <div className="flex justify-between pl-2">
                                            <span>Daily vault yield:</span>
                                            <span className="text-green-400">+{dailyYield.toFixed(5)} ADA</span>
                                        </div>
                                        <div className="flex justify-between pl-2">
                                            <span>Daily debt cost:</span>
                                            <span className="text-red-400">-{dailyCost.toFixed(5)} ADA</span>
                                        </div>
                                        <div className="flex justify-between pl-2 border-t border-white/10 pt-1">
                                            <span>Net daily reduction:</span>
                                            <span className="text-primary">{netReduction > 0 ? netReduction.toFixed(5) : "0.00000"} ADA</span>
                                        </div>
                                        <div className="flex justify-between pl-2 mt-1">
                                            <span>Debt repaid in:</span>
                                            <span className="text-white">~{daysToRepay === Infinity ? "NEVER" : daysToRepay} days (by yield alone)</span>
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-amber-500/80 text-center font-bold uppercase tracking-widest animate-pulse mt-2">
                                        ⚠ PREPROD_TESTNET // Simulated credit flow
                                    </div>

                                    <button 
                                        onClick={handleOpenCredit}
                                        disabled={!isLtvValid}
                                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-none text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(130,190,50)] active:translate-y-[2px] active:shadow-none mt-2"
                                    >
                                        [OPEN_CREDIT_LINE]
                                    </button>
                                </div>
                            ) : (
                                // ── ZERO POSITION, ZERO BALANCE ──
                                <div className="glass-card border border-white/10 p-12 flex flex-col items-center justify-center text-center gap-6">
                                    <ShieldCheck className="size-12 text-white/20" />
                                    <div className="flex flex-col gap-2">
                                        <span className="text-white font-bold uppercase tracking-widest">NO_ACTIVE_POSITION</span>
                                        <span className="text-white/40 text-[10px] max-w-xs uppercase leading-relaxed">
                                            Deposit into a vault first to earn vUSDCx, then lock it here to open a self-repaying credit line.
                                        </span>
                                    </div>
                                    <Link 
                                        href="/vaults"
                                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-6 py-3 font-bold text-[10px] uppercase tracking-widest transition-all mt-2"
                                    >
                                        [GO TO VAULTS →]
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Column: Instructions */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">HOW_IT_WORKS</span>
                    
                    <div className="glass-card border border-white/10 p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-[10px]">
                                01
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">DEPOSIT</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose pl-11">
                            Deposit tADA into a high-yield vault. Receive vUSDCx receipt tokens representing your stake.
                        </p>
                    </div>

                    <div className="glass-card border border-white/10 p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[10px]">
                                02
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">BORROW</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose pl-11">
                            Lock vUSDCx as collateral in the Credit Engine. Borrow up to 60% of its value immediately in tADA.
                        </p>
                    </div>

                    <div className="glass-card border border-white/10 p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center font-black text-[10px]">
                                03
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">AUTO_REPAY</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose pl-11">
                            Your underlying vault position keeps earning yield. That yield automatically services and pays down your debt daily.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
