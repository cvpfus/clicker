import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useGetTotalPendingRewards = () => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "totalPendingRewards",
  });
};
