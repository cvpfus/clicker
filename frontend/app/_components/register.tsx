import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { useState } from "react";
import { ClickerAbi } from "@/abi/Clicker";
import { ClickerAddress } from "@/constants";
import { config } from "@/wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useGetRegisteredStatusByAddress } from "@/hooks/use-get-registered-status";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const Register = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { writeContract } = useWriteContract();

  const searchParams = useSearchParams();
  const referrerFromSearchParams = searchParams.get("ref") ?? "";

  const [username, setUsername] = useState("");
  const [referrer, setReferrer] = useState(referrerFromSearchParams);
  const [isLoading, setIsLoading] = useState(false);

  const { queryKey } = useGetRegisteredStatusByAddress(address!);

  const handleRegister = async () => {
    if (!username) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsLoading(true);

    writeContract(
      {
        abi: ClickerAbi,
        address: ClickerAddress,
        functionName: "register",
        args: [username, referrer === "" ? "noReferrer" : referrer],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          setIsLoading(false);

          await queryClient.invalidateQueries({
            queryKey: queryKey,
            type: "all",
          });

          toast.success("Registration successful!");
        },
        onError: (error) => {
          toast.error(error.message);
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full justify-center items-center">
      <div className="flex flex-col items-start gap-2 mt-6 bg-card rounded-xl p-6 border border-border">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Username"
          required
          min={3}
          max={10}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />

        <Label htmlFor="referrer" className="mt-2">
          Referrer
        </Label>
        <Input
          id="referrer"
          placeholder="Referrer (optional)"
          autoComplete="off"
          onChange={(e) => setReferrer(e.target.value)}
          value={referrer}
          disabled={!!referrerFromSearchParams}
        />

        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="flex items-center gap-2 w-full mt-4"
        >
          {isLoading && <Loader2 className="animate-spin" />}
          <span>Register</span>
        </Button>
      </div>
    </div>
  );
};
