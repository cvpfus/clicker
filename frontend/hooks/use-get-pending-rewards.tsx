import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useGetPendingRewards = (address: `0x${string}`) => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "pendingRewards",
    args: [address],
  });
};
