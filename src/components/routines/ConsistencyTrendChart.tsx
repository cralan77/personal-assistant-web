"use client";

import { RoutineTrendLinePoint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ConsistencyTrendChartProps {
  series?: RoutineTrendLinePoint[];
  periodType?: "WEEK" | "MONTH";
}

export function ConsistencyTrendChart({
  series = [],
  periodType = "WEEK",
}: ConsistencyTrendChartProps) {
  const avgConsistency =
    series.length > 0
      ? series.reduce((acc, p) => acc + (p.consistencyPercentage || 0), 0) /
        series.length
      : 0;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <div>
              <CardTitle className="text-base font-semibold">
                Curva de Evolução de Consistência
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tendência histórica de cumprimento de metas por{" "}
                {periodType === "MONTH" ? "mês" : "semana"}
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-transparent w-fit"
          >
            Média Histórica: {avgConsistency.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {series.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            Ainda não há histórico suficiente para traçar a curva de tendência.
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="consistencyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="periodLabel"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [
                    `${Number(value).toFixed(1)}%`,
                    "Consistência",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="consistencyPercentage"
                  name="Consistência"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#consistencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
