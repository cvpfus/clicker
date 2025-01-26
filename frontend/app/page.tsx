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
import { InfoIcon, Loader2, PlusIcon } from "lucide-react";
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
import { useState } from "react";
import { useGetPendingRewards } from "@/hooks/use-get-pending-rewards";
import CopyButton from "./_components/copy-button";
import CountUp from "@/blocks/TextAnimations/CountUp/CountUp";
import { multipliers, clickCost } from "@/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGetTotalPendingRewards } from "@/hooks/use-get-total-pending-rewards";

export default function Home() {
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const balanceResult = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  const contractBalanceResult = useBalance({
    address: ClickerAddress,
  })

  const { queryKey: userInfoQueryKey, ...userInfoResult } = useGetUserInfo(
    address!
  );

  const { queryKey: pendingRewardsQueryKey, ...pendingRewardsResult } =
    useGetPendingRewards(address!);

  const { queryKey: totalPendingRewardsQueryKey, ...totalPendingRewardsResult } =
    useGetTotalPendingRewards();

  const { writeContract } = useWriteContract();

  const [isIncreasingMultiplier, setIsIncreasingMultiplier] = useState<{
    [key: number]: boolean;
  }>({});
  const [multiplierAdded, setMultiplierAdded] = useState(false);
  const [isAddingClicks, setIsAddingClicks] = useState(false);
  const [clicksAdded, setClicksAdded] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const currentPool = contractBalanceResult.data && totalPendingRewardsResult.data ? (Number(contractBalanceResult.data.value) - Number(totalPendingRewardsResult.data)) / 2 : 0;

  const handleIncreaseMultiplier = (multiplier: number, price: number) => {
    setIsIncreasingMultiplier((prev) => ({ ...prev, [multiplier]: true }));
    setMultiplierAdded(false);

    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "increaseMultiplier",
        value: parseEther(price.toString()),
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          await queryClient.invalidateQueries({
            queryKey: userInfoQueryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: balanceResult.queryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: contractBalanceResult.queryKey,
            type: "all",
          });

          toast.success("Multiplier increased successfully");

          setIsIncreasingMultiplier((prev) => ({
            ...prev,
            [multiplier]: false,
          }));
          setMultiplierAdded(true);
        },
        onError: (error) => {
          toast.error(error.message);

          setIsIncreasingMultiplier((prev) => ({
            ...prev,
            [multiplier]: false,
          }));
        },
      }
    );
  };

  const handleAddClicks = () => {
    setIsAddingClicks(true);
    setClicksAdded(false);

    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "click",
        value: parseEther(clickCost),
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          await queryClient.invalidateQueries({
            queryKey: userInfoQueryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: balanceResult.queryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: contractBalanceResult.queryKey,
            type: "all",
          });

          toast.success("Clicks added successfully");

          setIsAddingClicks(false);
          setClicksAdded(true);
        },
        onError: (error) => {
          toast.error(error.message);

          setIsAddingClicks(false);
        },
      }
    );
  };

  const handleClaimReward = () => {
    setIsClaimingReward(true);

    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "claimReward",
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          await queryClient.invalidateQueries({
            queryKey: pendingRewardsQueryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: balanceResult.queryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: contractBalanceResult.queryKey,
            type: "all",
          });

          await queryClient.invalidateQueries({
            queryKey: totalPendingRewardsQueryKey,
            type: "all",
          });

          toast.success("Reward claimed successfully");

          setIsClaimingReward(false);
        },
        onError: (error) => {
          toast.error(error.message);

          setIsClaimingReward(false);
        },
      }
    );
  };

  return (
    <div className="h-full pt-4">
      <PageTitle
        title={`Welcome, ${userInfoResult.data ? userInfoResult.data[0] : "user"
          }`}
      />
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Pool (TEA)</CardTitle>
            <CardDescription>
              The current pool is dynamically updated and distributed to the top 50 users every 6 hours.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <h1 className="text-3xl font-bold">
              {currentPool === 0
                ? "0"
                : Number(
                  formatEther(BigInt(currentPool))
                ).toFixed(5)}
            </h1>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 min-[820px]:grid-cols-2 min-[1340px]:grid-cols-4 gap-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Balance (TEA)</CardTitle>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center">
              <h1 className="text-3xl font-bold">
                {Number(
                  formatEther(balanceResult.data?.value ?? BigInt(0))
                ).toFixed(5)}
              </h1>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Referral URL</span>
                <CopyButton
                  text={`${BASE_URL}/?ref=${userInfoResult.data ? userInfoResult.data[0] : ""
                    }`}
                  disabled={!userInfoResult.data}
                />
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center">
              <span className="font-bold">
                {BASE_URL}/?ref=
                {userInfoResult.data ? userInfoResult.data[0] : ""}
              </span>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Referrals</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" className="size-6">
                      <InfoIcon className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Referrals</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      When a new user registers using your referral URL, both you and the new user will receive a +1 multiplier.
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center">
              <h1 className="text-3xl font-bold">
                {userInfoResult.data ? userInfoResult.data[2] : 0}
              </h1>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Multiplier</CardTitle>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center">
              <h1 className="text-3xl font-bold">
                {userInfoResult.data ? (
                  <CountUp
                    from={Number(userInfoResult.data[1])}
                    to={Number(userInfoResult.data[1])}
                    separator=","
                    direction="up"
                    duration={1}
                    startWhen={multiplierAdded}
                  />
                ) : (
                  0
                )}
              </h1>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Rewards (TEA)</CardTitle>
            <CardDescription>
              Every 6 hours, the pending rewards for the top 50 users will be
              updated. These users can then manually claim their rewards.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {Number(formatEther(pendingRewardsResult.data ?? BigInt(0))) === 0
                ? "0"
                : Number(
                  formatEther(pendingRewardsResult.data ?? BigInt(0))
                ).toFixed(5)}
            </h1>
            <Button
              onClick={handleClaimReward}
              disabled={!pendingRewardsResult.data || isClaimingReward}
              className="flex items-center gap-2"
            >
              {isClaimingReward && <Loader2 className="size-4 animate-spin" />}
              <span>Claim</span>
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
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
                {userInfoResult.data ? (
                  <CountUp
                    from={Number(userInfoResult.data[3])}
                    to={Number(userInfoResult.data[3])}
                    separator=","
                    direction="up"
                    duration={1}
                    startWhen={clicksAdded}
                  />
                ) : (
                  0
                )}
              </h1>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Add Clicks</CardTitle>
              <CardDescription>
                Each transaction costs 0.1 TEA no matter how many multipliers
                you have.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-grow flex items-center justify-center">
              <Button
                onClick={() => handleAddClicks()}
                disabled={isAddingClicks}
                className="flex items-center gap-2 rounded-md"
              >
                {isAddingClicks ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                <span>
                  Add {userInfoResult.data ? userInfoResult.data[1] : 0} Clicks
                </span>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Increase Multiplier</CardTitle>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              {multipliers.map((multiplier, index) => (
                <div
                  className="flex gap-2 items-center justify-between"
                  key={index}
                >
                  <div>
                    +{multiplier} Multiplier ({multiplier} TEA)
                  </div>
                  <Button
                    onClick={() =>
                      handleIncreaseMultiplier(multiplier, multiplier)
                    }
                    disabled={isIncreasingMultiplier[multiplier]}
                    className="flex items-center gap-2"
                  >
                    {isIncreasingMultiplier[multiplier] && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    <span>Buy</span>
                  </Button>
                </div>
              ))}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
