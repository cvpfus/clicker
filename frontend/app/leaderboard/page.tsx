import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { InfoIcon } from "lucide-react";

export default function Leaderboard() {
  return (
    <div className="h-full">
      <PageTitle title="Leaderboard" />
      <div className="flex justify-between items-start">
        <span className="text-sm text-muted-foreground">
          Top 50 users will earn accumulated TEA every 6 hours.
        </span>
        <Button size="icon" variant="outline" className="size-6">
          <InfoIcon className="size-4" />
        </Button>
      </div>
      <div className="mt-4">
        <span>
          Time left until next TEA distribution: <span>12:00:00</span>
        </span>
      </div>
    </div>
  );
}
