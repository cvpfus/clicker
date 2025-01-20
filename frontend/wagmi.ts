import { cookieStorage, createStorage, type Config } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { teaTestnet } from "./constants";
import { bscTestnet } from "@reown/appkit/networks";

export const projectId = "b8fe50ac0bee495a7edce32a0bbca77d";

export const networks = [bscTestnet];

export const metadata = {
  name: "Clicker",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: Config;
  }
}
