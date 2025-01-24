"use client";

import { useGetLeaderboardInfo } from "@/hooks/use-get-leaderboard-info";
import {
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableProvider,
  TableHeaderGroup,
  TableBody,
  TableRow,
  TableCell,
  type ColumnDef,
} from "@/components/ui/kibo-ui/table";
import { useCountdown } from "@/hooks/use-countdown";
import { formatTime } from "@/lib/utils";


interface LeaderboardInfo {
  id: number;
  username: string;
  userAddress: `0x${string}`;
  clicks: number;
}

export const LeaderboardTable = () => {
  const { data, status } = useGetLeaderboardInfo();

  const { timeLeft } = useCountdown();

  const sortedLeaderboard: LeaderboardInfo[] =
    status === "success"
      ? data
        .filter((user) => user.clicks > 0)
        .sort((a, b) => Number(b.clicks) - Number(a.clicks))
        .map((user, index) => ({
          ...user,
          id: index,
          clicks: Number(user.clicks),
        }))
      : [];

  const columns: ColumnDef<LeaderboardInfo>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Rank" />
      ),
      cell: ({ row }) => {
        const rank = row.original.id + 1;
        const medals = ["🥇", "🥈", "🥉"];
        return <span>{rank <= 3 ? `${medals[rank - 1]} ${rank}` : rank}</span>;
      },
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Username" />
      ),
      cell: ({ row }) => row.original.username,
    },
    {
      accessorKey: "clicks",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Clicks" />
      ),
      cell: ({ row }) => row.original.clicks,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-lg font-bold">Current Leaderboard</span>
      <span className="text-sm text-muted-foreground">
        Estimated time remaining until leaderboard reset: {formatTime(timeLeft)}.
      </span>
      <TableProvider columns={columns} data={sortedLeaderboard}>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
              {({ header }) => <TableHead key={header.id} header={header} />}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => (
            <TableRow key={row.id} row={row}>
              {({ cell }) => <TableCell key={cell.id} cell={cell} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
    </div>
  );
};
