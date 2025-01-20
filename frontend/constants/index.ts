import { defineChain } from "viem";

export const BASE_URL = "https://clicker.assam.dev";

export const ClickerAddress = "0x8489530f075D99e1c9e5D6CbC3e543a71F16DA7B";

export const teaTestnet = defineChain({
  id: 93384,
  name: "tea-assam",
  rpcUrls: {
    default: {
      http: ["https://assam-rpc.tea.xyz"],
    },
  },
  nativeCurrency: {
    name: "tea-assam",
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
