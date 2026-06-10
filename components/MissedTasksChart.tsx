"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TaskData } from "./TasksTable";

interface MissedTasksChartProps {
  tasks: TaskData[];
}

export function MissedTasksChart({ tasks }: MissedTasksChartProps) {
  const chartData = useMemo(() => {
    const missedCounts: Record<string, number> = {};

    tasks.forEach((task) => {
      // Check if status is false (pending)
      const isPending =
        task.status === "FALSE" ||
        task.status?.toLowerCase() === "false" ||
        task.status === "" ||
        !task.status;

      if (isPending && task.discord_name) {
        missedCounts[task.discord_name] = (missedCounts[task.discord_name] || 0) + 1;
      }
    });

    return Object.entries(missedCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count); // Sort descending by missed count
  }, [tasks]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-500 bg-white rounded-md border shadow-sm">
        Everyone has completed their tasks! 🎉
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full bg-white p-4 rounded-md border shadow-sm pt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 30, // Extra bottom margin for rotated labels
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            name="Missed Tasks"
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
