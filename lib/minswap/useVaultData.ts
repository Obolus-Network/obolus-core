"use client";

import { useState, useEffect } from "react";
import { OBOLUS_VAULT_STRATEGIES } from "./pools";
import { getPoolMetrics } from "./api";

export interface VaultMetrics {
  vaultId: string;
  name: string;
  platform: string;
  type: string;
  category: string;
  description: string;
  risk: string;
  minswapPoolId: string | null;
  targetAPY: number;
  liveTVL?: number;
  liveAPY?: number;
  volume24h?: number;
  dataSource: "live" | "static" | "fallback";
  poolMetrics?: any;
  color: string;
}

/**
 * Custom React hook to fetch and keep vault data synced with live Minswap metrics
 */
export function useVaultData() {
  const [vaults, setVaults] = useState<VaultMetrics[]>(OBOLUS_VAULT_STRATEGIES as any);
  const [totalTVL, setTotalTVL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchVaultData() {
      // Don't show loading on every interval pulse
      if (!lastUpdated) setIsLoading(true);
      
      try {
        // Fetch pool metrics for vaults that have a Minswap pool ID
        const enrichedVaults = await Promise.all(
          OBOLUS_VAULT_STRATEGIES.map(async (vault) => {
            if (!vault.minswapPoolId) {
              // No live pool — return static data
              return { 
                ...vault, 
                liveTVL: 0, 
                liveAPY: vault.targetAPY, 
                volume24h: 0, 
                dataSource: "static" 
              };
            }
            
            const metrics = await getPoolMetrics(vault.minswapPoolId);
            
            if (!metrics) {
              // API fail — return static data with fallback tag
              return { 
                ...vault, 
                liveTVL: 0, 
                liveAPY: vault.targetAPY,
                volume24h: 0, 
                dataSource: "fallback" 
              };
            }
            
            return {
              ...vault,
              liveTVL: parseFloat(metrics.liquidity) || 0,
              liveAPY: metrics.trading_fee_apr 
                ? parseFloat(metrics.trading_fee_apr) * 100 
                : vault.targetAPY,
              volume24h: parseFloat(metrics.volume_24h) || 0,
              dataSource: "live",
              poolMetrics: metrics
            } as VaultMetrics;
          })
        );
        
        const total = enrichedVaults.reduce((sum, v) => sum + (v.liveTVL || 0), 0);
        setVaults(enrichedVaults as VaultMetrics[]);
        setTotalTVL(total);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to sync vault data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchVaultData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchVaultData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  const avgAPY = vaults.reduce((sum, v) => 
    sum + (v.liveAPY || v.targetAPY), 0) / (vaults.length || 1);
  
  return { vaults, totalTVL, avgAPY, isLoading, lastUpdated };
}
