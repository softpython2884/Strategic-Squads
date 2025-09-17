"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

type Props = {
  data: {
    composition: string;
    blue: number;
    red: number;
  }[];
};

export default function UnitCompositionChart({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="composition"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="blue" fill="var(--color-blue)" radius={4} />
        <Bar dataKey="red" fill="var(--color-red)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
