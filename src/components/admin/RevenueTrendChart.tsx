import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

const UNIT_COLORS: Record<string, string> = {
  spa: "#ec4899",
  fitness: "#22c55e",
  coworking: "#3b82f6",
  summit: "#a855f7",
  photo_booth: "#f59e0b",
  voice_vault: "#06b6d4",
  elevated_by_elyse: "#f43f5e",
};

const UNIT_LABELS: Record<string, string> = {
  spa: "Spa",
  fitness: "Fitness",
  coworking: "Coworking",
  summit: "Summit",
  photo_booth: "Photo Booth",
  voice_vault: "Voice Vault",
  elevated_by_elyse: "Elevated",
};

export function RevenueTrendChart() {
  const [viewMode, setViewMode] = useState<"all" | "individual">("all");

  const { data: chartData } = useQuery({
    queryKey: ["revenue_trend_6mo"],
    queryFn: async () => {
      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

      const { data, error } = await supabase
        .from("crm_revenue_events")
        .select("amount, business_unit, revenue_date")
        .gte("revenue_date", format(sixMonthsAgo, "yyyy-MM-dd"));

      if (error) throw error;

      // Build 6-month buckets
      const months: { month: string; label: string; [key: string]: any }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        months.push({
          month: format(d, "yyyy-MM"),
          label: format(d, "MMM"),
          total: 0,
          spa: 0, fitness: 0, coworking: 0, summit: 0,
          photo_booth: 0, voice_vault: 0, elevated_by_elyse: 0,
        });
      }

      (data || []).forEach((rev: any) => {
        if (!rev.revenue_date) return;
        const monthKey = rev.revenue_date.substring(0, 7);
        const bucket = months.find((m) => m.month === monthKey);
        if (bucket) {
          const amt = Number(rev.amount) || 0;
          bucket.total += amt;
          const unit = rev.business_unit || "summit";
          if (bucket[unit] !== undefined) {
            bucket[unit] += amt;
          }
        }
      });

      return months;
    },
    refetchInterval: 120000,
  });

  const formatYAxis = (value: number) => `$${(value / 1000).toFixed(0)}k`;
  const formatTooltip = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const units = Object.keys(UNIT_COLORS);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-zinc-100">Revenue Overview</CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant={viewMode === "all" ? "default" : "outline"}
            className={viewMode === "all" ? "bg-amber-500 text-black" : "border-zinc-700 text-zinc-400"}
            onClick={() => setViewMode("all")}>
            All Units
          </Button>
          <Button size="sm" variant={viewMode === "individual" ? "default" : "outline"}
            className={viewMode === "individual" ? "bg-amber-500 text-black" : "border-zinc-700 text-zinc-400"}
            onClick={() => setViewMode("individual")}>
            By Unit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
              <YAxis tickFormatter={formatYAxis} stroke="#71717a" fontSize={12} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#e4e4e7" }}
              />
              {viewMode === "all" ? (
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total Revenue" />
              ) : (
                <>
                  {units.map((unit) => (
                    <Bar
                      key={unit}
                      dataKey={unit}
                      stackId="a"
                      fill={UNIT_COLORS[unit]}
                      name={UNIT_LABELS[unit]}
                    />
                  ))}
                  <Legend
                    wrapperStyle={{ color: "#a1a1aa", fontSize: 11 }}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
