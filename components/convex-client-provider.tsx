"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { usePrivy } from "@privy-io/react-auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to provide OAuth/JWT integration with Privy
// This is used by ConvexProviderWithAuth to fetch the JWT for each request
function usePrivyAuth() {
    const { authenticated, getAccessToken, logout } = usePrivy();

    return {
        isLoading: !authenticated, // Replace with proper loading state if needed
        isAuthenticated: authenticated,
        // Provide a fetcher that calls getAccessToken with Convex's expected options
        fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
            try {
                const token = await getAccessToken(); // Privy doesn't use standard forceRefresh option the same way
                return token;
            } catch (e) {
                console.error("Failed to fetch access token", e);
                return null;
            }
        },
    };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithAuth client={convex} useAuth={usePrivyAuth}>
            {children}
        </ConvexProviderWithAuth>
    );
}
