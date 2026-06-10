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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TaskData } from "./TasksTable";
import { useI18n } from "@/components/providers/I18nProvider";
import { useTheme } from "next-themes";

interface TasksOverviewChartProps {
  tasks: TaskData[];
}

export function TasksOverviewChart({ tasks }: TasksOverviewChartProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  
  const { barChartData, totalTasks, totalCompleted } = useMemo(() => {
    const userStats: Record<string, { total: number; completed: number }> = {};
    let totalTasksCount = 0;
    let completedCount = 0;

    tasks.forEach((task) => {
      const isCompleted =
        task.status === "TRUE" ||
        task.status?.toLowerCase() === "true" ||
        task.status === "เสร็จแล้ว";

      totalTasksCount++;
      if (isCompleted) completedCount++;

      if (task.discord_name) {
        if (!userStats[task.discord_name]) {
          userStats[task.discord_name] = { total: 0, completed: 0 };
        }
        userStats[task.discord_name].total += 1;
        if (isCompleted) {
          userStats[task.discord_name].completed += 1;
        }
      }
    });

    const barData = Object.entries(userStats)
      .map(([name, stats]) => ({
        name,
        [t("totalTasks")]: stats.total,
        [t("completedTasks")]: stats.completed,
      }))
      .sort((a, b) => (b[t("totalTasks")] as number) - (a[t("totalTasks")] as number));

    return {
      barChartData: barData,
      totalTasks: totalTasksCount,
      totalCompleted: completedCount,
    };
  }, [tasks, t]);

  const pieData = [
    { name: "Completed", value: totalCompleted },
    { name: "Pending", value: totalTasks - totalCompleted },
  ];
  
  // Theme colors
  const isDark = theme === "dark";
  const primaryBlue = "#3b82f6";
  const primaryPurple = "#8b5cf6";
  const secondaryGray = isDark ? "#1e293b" : "#e2e8f0";
  const COLORS = [primaryBlue, secondaryGray];

  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  if (barChartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
        {t("noTasksChart")}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{t("tasksOverview")}</h3>
      </div>
      
      {/* Double Bar Chart Area */}
      <div className="h-[300px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barChartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              dy={10}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
              contentStyle={{ 
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '12px', 
                border: isDark ? '1px solid #1e293b' : 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#64748b' }}/>
            <Bar 
              dataKey={t("totalTasks")}
              fill={primaryBlue}
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
            <Bar 
              dataKey={t("completedTasks")} 
              fill={primaryPurple}
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Circular Progress Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
          <div className="h-[120px] w-[120px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800 dark:text-white">{completionRate}%</span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("completionRate")}</p>
          <p className="text-xs text-green-500 dark:text-green-400 font-medium">{totalCompleted} {t("tasksCompleted")}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
          <div className="h-[120px] w-[120px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: totalTasks - totalCompleted }, { value: totalCompleted }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={primaryPurple} />
                  <Cell fill={secondaryGray} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800 dark:text-white">{totalTasks - totalCompleted}</span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("pendingTasksLabel")}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t("outOfTotal")} {totalTasks}</p>
        </div>
      </div>
    </div>
  );
}
