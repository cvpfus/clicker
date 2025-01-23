import { defineChain } from "viem";

export const BASE_URL = "https://clicker.assam.dev";

export const ClickerAddress = "0xC4aD0a4142c4B43Af8FD12A3908284ea3c548E60";

export const multipliers = [10, 25, 50];

export const clickCost = "0.1";

export const teaTestnet = defineChain({
  id: 93384,
  name: "tea-assam",
  rpcUrls: {
    default: {
      http: ["https://assam-rpc.tea.xyz"],
    },
  },
  nativeCurrency: {
    name: "Tea",
    symbol: "TEA",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Tea Testnet Explorer",
      url: "https://assam.tea.xyz",
    },
  },
});
