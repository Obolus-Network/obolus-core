/**
 * Minswap API Integration Utility
 * Handles live data fetching from Minswap API (Mainnet)
 */

const MINSWAP_API_BASE = '/api/minswap/v1';
const MINSWAP_AGG_BASE = '/api/minswap-agg';

/**
 * Handle API rate limiting and basic error wrapping
 */
async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 1): Promise<any> {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      if (maxRetries > 0) {
        // Wait 1s and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, maxRetries - 1);
      }
      console.warn(`Minswap API Rate Limited (429): ${url}`);
      return null;
    }

    if (!response.ok) {
      console.warn(`Minswap API Error (${response.status}): ${url}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Minswap API Fetch Failed: ${url}`, error);
    return null;
  }
}

/**
 * 1a. getPoolMetrics(poolId: string)
 * Fetches current liquidity, volume, and APR for a specific pool
 */
export async function getPoolMetrics(poolId: string) {
  return await fetchWithRetry(`${MINSWAP_API_BASE}/pools/${poolId}/metrics?currency=usd`);
}

/**
 * 1b. getMultiplePoolMetrics(poolIds: string[])
 * Fetches metrics for top pools or filtered set
 */
export async function getMultiplePoolMetrics() {
  const body = {
    term: "",
    only_verified: true,
    limit: 10,
    sort_field: "liquidity",
    sort_direction: "desc",
    currency: "usd"
  };

  return await fetchWithRetry(`${MINSWAP_API_BASE}/pools/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

/**
 * 1c. getPoolTVLTimeseries(poolId: string, period = "1w")
 * Returns historical TVL data
 */
export async function getPoolTVLTimeseries(poolId: string, period = "1w") {
  return await fetchWithRetry(`${MINSWAP_API_BASE}/pools/${poolId}/tvl/timeseries?period=${period}&currency=usd`);
}

/**
 * 1d. getPoolFeeTimeseries(poolId: string, period = "1w")
 * Returns historical fee data
 */
export async function getPoolFeeTimeseries(poolId: string, period = "1w") {
  return await fetchWithRetry(`${MINSWAP_API_BASE}/pools/${poolId}/fees/timeseries?period=${period}&currency=usd`);
}

/**
 * 1e. getAssetPrice(assetId: string)
 */
export async function getAssetPrice(assetId: string) {
  return await fetchWithRetry(`${MINSWAP_API_BASE}/assets/${assetId}/metrics?currency=usd`);
}

/**
 * 1f. getADAPrice()
 * Fetches current ADA price in USD
 */
export async function getADAPrice() {
  const data = await fetchWithRetry(`${MINSWAP_AGG_BASE}/ada-price?currency=usd`);
  return data?.price || null;
}
