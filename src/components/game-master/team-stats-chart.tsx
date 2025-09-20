
"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getTeamResourceData } from "@/app/actions";
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  blue: {
    label: "Équipe Bleue",
    color: "hsl(var(--chart-1))",
  },
  red: {
    label: "Équipe Rouge",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type ChartData = {
  minute: string;
  blue: number;
  red: number;
}[];

export default function TeamStatsChart() {
  const [data, setData] = useState<ChartData | null>(null);

  useEffect(() => {
    getTeamResourceData().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: -20,
          right: 12,
          top: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="minute"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-blue)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-blue)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillRed" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-red)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-red)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="blue"
          type="natural"
          fill="url(#fillBlue)"
          stroke="var(--color-blue)"
          stackId="a"
        />
        <Area
          dataKey="red"
          type="natural"
          fill="url(#fillRed)"
          stroke="var(--color-red)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
