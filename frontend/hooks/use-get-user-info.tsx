import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useGetUserInfo = (address: `0x${string}`) => {
  return useReadContract({
    abi: ClickerAbi,
    address: ClickerAddress,
    functionName: "users",
    args: [address],
    query: {
      enabled: !!address,
    },
  });


}