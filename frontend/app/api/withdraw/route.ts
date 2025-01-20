import { NextRequest, NextResponse } from "next/server";
import Mergent from "mergent";

export async function POST(req: NextRequest) {
  const mergent = new Mergent(process.env.MERGENT_API_KEY!);

  const isValid = mergent.requestValidator.validateSignature(
    "",
    req.headers.get("x-mergent-signature") ?? ""
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  return NextResponse.json({ message: "Withdrawal request received" });
}
