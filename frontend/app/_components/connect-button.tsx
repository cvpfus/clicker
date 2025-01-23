"use client";

import { Button } from "@/components/ui/button";
import { useAppKit } from "@reown/appkit/react";

// currently not working
export default function ConnectButton() {
  const { open } = useAppKit();

  const handleConnect = () => {
    open();
  };

  return <Button onClick={handleConnect}>Connect</Button>;
}
