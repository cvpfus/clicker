"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { CopyIcon, PlusIcon } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useGetUserInfo } from "@/hooks/use-get-user-info";
import { useWriteContract } from "wagmi";
import { ClickerAbi } from "@/abi/Clicker";
import { BASE_URL, ClickerAddress } from "@/constants";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/wagmi";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const balanceResult = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  const { queryKey, ...userInfoResult } = useGetUserInfo(address!);

  const { writeContract } = useWriteContract();

  const handleIncreaseMultiplier = (amount: number) => {
    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "increaseMultiplier",
        value: parseEther(amount.toString()),
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          await queryClient.invalidateQueries({
            queryKey: queryKey,
            type: "all",
          });

          toast.success("Multiplier increased successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleAddClicks = () => {
    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "click",
        value: parseEther("0.000001"),
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          await queryClient.invalidateQueries({
            queryKey: queryKey,
            type: "all",
          });

          toast.success("Clicks added successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <div className="h-full">
      <PageTitle title="Home" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance (TEA)</CardTitle>
            </CardHeader>
            <CardFooter>
              <h1 className="text-3xl font-bold">
                {Number(
                  formatEther(balanceResult.data?.value ?? BigInt(0))
                ).toFixed(5)}
              </h1>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Referral URL</span>
                <Button size="icon" className="size-6">
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardFooter>
              <span className="font-bold">
                {BASE_URL}/?ref={userInfoResult.data ? userInfoResult.data[0] : ""}
              </span>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Referrals</CardTitle>
            </CardHeader>
            <CardFooter>
              <h1 className="text-3xl font-bold">
                {userInfoResult.data ? userInfoResult.data[3] : 0}
              </h1>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Multiplier</CardTitle>
            </CardHeader>
            <CardFooter>
              <h1 className="text-3xl font-bold">
                {userInfoResult.data ? userInfoResult.data[2] : 0}
              </h1>
            </CardFooter>
          </Card>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Total Clicks</CardTitle>
              <CardDescription>
                Total clicks will be set to 0 if you are in the top 50 at the
                end of every 6 hours.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center justify-center">
              <h1 className="text-3xl font-bold">
                {userInfoResult.data ? userInfoResult.data[1] : 0}
              </h1>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Add Clicks</CardTitle>
              <CardDescription>
                Each transaction costs 0.01 TEA no matter how many multipliers
                you have.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center justify-center">
              <Button onClick={() => handleAddClicks()}>
                <PlusIcon className="w-4 h-4" />
                <span>
                  Add {userInfoResult.data ? userInfoResult.data[2] : 0} Clicks
                </span>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Increase Multiplier</CardTitle>
            </CardHeader>
            <CardFooter className="grid grid-cols-2 items-center gap-2">
              <div>+10 Multiplier</div>
              <Button onClick={() => handleIncreaseMultiplier(0.0001)}>
                Buy (10 TEA)
              </Button>
              <div>+25 Multiplier</div>
              <Button onClick={() => handleIncreaseMultiplier(0.00025)}>
                Buy (25 TEA)
              </Button>
              <div>+50 Multiplier</div>
              <Button onClick={() => handleIncreaseMultiplier(0.0005)}>
                Buy (50 TEA)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
