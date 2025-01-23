import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useGetLeaderboardInfo = () => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "getUnsortedLeaderboard",
  });
};
