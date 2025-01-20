import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useGetRegisteredStatusByAddress = (
  address: `0x${string}`
) => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "getRegisteredStatusByAddress",
    args: [address],
    query: {
      enabled: !!address,
    },
  });
};
