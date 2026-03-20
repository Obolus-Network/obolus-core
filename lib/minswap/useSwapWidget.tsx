"use client";

import { Widget } from "@minswap/aggregator-widget";

export const MINSWAP_PARTNER_CODE = "obolus"; 
// Apply for real partner code at minswap.org/partners later

/**
 * Minswap Aggregator Widget Wrapper
 * For use in Swap tab of vault cards
 */
export function MinswapSwapWidget({ 
  defaultToken 
}: { 
  defaultToken?: string 
}) {
  return (
    <Widget
      partnerCode={MINSWAP_PARTNER_CODE}
      displayMode="full"
      defaultAsset={defaultToken}
    />
  );
}
