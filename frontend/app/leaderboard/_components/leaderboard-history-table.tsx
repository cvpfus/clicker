"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useGetLeaderboardHistory } from "@/hooks/use-get-leaderboard-history";
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

interface WinnerInfo {
  id: number;
  username: string;
  userAddress: `0x${string}`;
  clicks: number;
}

interface LeaderboardHistory {
  id: number;
  winners: WinnerInfo[];
  timestamp: number;
  totalAmount: number;
}

export const LeaderboardHistoryTable = () => {
  const { data, status } = useGetLeaderboardHistory();

  const leaderboardHistory: LeaderboardHistory[] =
    status === "success"
      ? data
          .map((item, index) => ({
            id: index,
            winners: item.winners
              .filter((winner) => winner.clicks > 0)
              .map((winner, index) => ({
                ...winner,
                id: index,
                clicks: Number(winner.clicks),
              })),
            timestamp: Number(item.timestamp),
            totalAmount: Number(item.totalAmount),
          }))
          .toReversed()
      : [];

  console.log(leaderboardHistory);

  const columns: ColumnDef<WinnerInfo>[] = [
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

  if (status === "success" && data.length === 0) return null;

  return (
    <div className="flex flex-col my-4">
      <span className="text-lg font-bold">
        {status === "success"
          ? `Last ${data.length} Leaderboard${data.length > 1 ? "s" : ""}`
          : ""}
      </span>
      <Accordion type="single" collapsible>
        {status === "success" &&
          leaderboardHistory.map((item) => (
            <AccordionItem value={item.id.toString()} key={item.id}>
              <AccordionTrigger>
                {new Date(item.timestamp * 1000).toLocaleString()}
              </AccordionTrigger>
              <AccordionContent>
                <TableProvider columns={columns} data={item.winners}>
                  <TableHeader>
                    {({ headerGroup }) => (
                      <TableHeaderGroup
                        key={headerGroup.id}
                        headerGroup={headerGroup}
                      >
                        {({ header }) => (
                          <TableHead key={header.id} header={header} />
                        )}
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
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
};
