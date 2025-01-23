import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { InfoIcon } from "lucide-react";
import { LeaderboardTable } from "./_components/leaderboard-table";
import { LeaderboardHistoryTable } from "./_components/leaderboard-history-table";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Metadata } from "next";

const REWARD_DISTRIBUTION = [
  { rank: "1", percentage: "15%" },
  { rank: "2", percentage: "12%" },
  { rank: "3", percentage: "10%" },
  { rank: "4", percentage: "8%" },
  { rank: "5", percentage: "6%" },
  { rank: "6-10", percentage: "15% (3% each)" },
  { rank: "11-20", percentage: "15% (1.5% each)" },
  { rank: "21-30", percentage: "10% (1% each)" },
  { rank: "31-50", percentage: "9% (0.45% each)" },
] as const;

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Leaderboard is reset every 6 hours and the top 50 users will earn accumulated TEA.",
};

export default function Leaderboard() {
  return (
    <div className="h-full pt-4">
      <PageTitle title="Leaderboard" />
      <div className="flex gap-2 justify-between items-start mb-4">
        <span className="text-sm text-muted-foreground">
          Leaderboard is reset every 6 hours and the top 50 users will earn
          accumulated TEA.
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="size-6">
              <InfoIcon className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reward Distribution (Top 50 Users)</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead className="text-center">
                    Percentage of Total TEA Distributed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REWARD_DISTRIBUTION.map((row) => (
                  <TableRow key={row.rank}>
                    <TableCell className="text-center">{row.rank}</TableCell>
                    <TableCell className="text-center">
                      {row.percentage}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>

      <LeaderboardTable />
      <LeaderboardHistoryTable />
    </div>
  );
}
