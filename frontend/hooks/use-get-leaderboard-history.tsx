import { useReadContract } from "wagmi";
import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";

export const useGetLeaderboardHistory = () => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "getLast5LeaderboardHistory",
  });
};
