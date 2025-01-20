"use client";

import { useGetRegisteredStatusByAddress } from "@/hooks/use-get-registered-status";
import { useAccount } from "wagmi";
import { Register } from "./register";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default function Connect({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { isConnected, address } = useAccount();

  const statusResult = useGetRegisteredStatusByAddress(address!);

  if (isConnected && statusResult.status === "pending") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isConnected && statusResult.status === "error") {
    return (
      <div className="flex h-full items-center justify-center">
        <span>{statusResult.error?.message}</span>
      </div>
    );
  }

  if (
    isConnected &&
    statusResult.status === "success" &&
    !statusResult.data
  ) {
    return (
      <div className="flex flex-col h-full">
        <PageTitle title="Register" />
        <span className="text-sm text-muted-foreground">
          Earn +1 multiplier for both you and your referrer if you register with
          a referrer.
        </span>
        <Register />
      </div>
    );
  }

  return (
    <>
      {isConnected ? (
        children
      ) : (
        <div className="flex h-full items-center justify-center">
          <span>Please connect your wallet.</span>
        </div>
      )}
    </>
  );
}
