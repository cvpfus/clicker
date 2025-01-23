import { NextRequest, NextResponse } from "next/server";
import Mergent from "mergent";
import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ClickerAddress, teaTestnet } from "@/constants";
import { ClickerAbi } from "@/abi/Clicker";

export async function POST(req: NextRequest) {
  const mergent = new Mergent(process.env.MERGENT_API_KEY!);

  const isValid = mergent.requestValidator.validateSignature(
    "",
    req.headers.get("x-mergent-signature") ?? ""
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    // Create account from private key
    const account = privateKeyToAccount(
      process.env.PRIVATE_KEY! as `0x${string}`
    );

    // Create wallet client
    const client = createWalletClient({
      account,
      chain: teaTestnet,
      transport: http(),
    });

    // Call resetLeaderboard
    const hash = await client.writeContract({
      address: ClickerAddress,
      abi: ClickerAbi,
      functionName: "resetLeaderboard",
    });

    // Create public client to wait for transaction
    const publicClient = createPublicClient({
      chain: teaTestnet,
      transport: http(),
    });

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      message: "Leaderboard reset successful",
      txHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error resetting leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to reset leaderboard" },
      { status: 500 }
    );
  }
}
