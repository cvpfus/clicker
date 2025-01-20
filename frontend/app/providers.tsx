"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { wagmiAdapter, projectId, metadata } from "@/wagmi";
import { createAppKit } from "@reown/appkit/react";
import { teaTestnet } from "@/constants";
import { config as wagmiConfig } from "@/wagmi";
import { bscTestnet } from "@reown/appkit/networks";

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bscTestnet],
  defaultNetwork: bscTestnet,
  metadata: metadata,
  themeMode: "dark",
  features: {
    analytics: true,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
  },
  themeVariables: {
    "--w3m-accent": "#00BB7F",
  },
});

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(() => wagmiConfig);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
