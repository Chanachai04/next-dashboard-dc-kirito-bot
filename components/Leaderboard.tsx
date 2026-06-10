"use client";

import { useMemo } from "react";
import { TaskData } from "./TasksTable";
import { useI18n } from "@/components/providers/I18nProvider";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardProps {
  tasks: TaskData[];
}

export function Leaderboard({ tasks }: LeaderboardProps) {
  const { t } = useI18n();

  const topUsers = useMemo(() => {
    const userStats: Record<string, { total: number; completed: number }> = {};

    tasks.forEach((task) => {
      if (!task.discord_name) return;
      
      const isCompleted =
        task.status === "TRUE" ||
        task.status?.toLowerCase() === "true" ||
        task.status === "เสร็จแล้ว";

      if (!userStats[task.discord_name]) {
        userStats[task.discord_name] = { total: 0, completed: 0 };
      }
      userStats[task.discord_name].total += 1;
      if (isCompleted) {
        userStats[task.discord_name].completed += 1;
      }
    });

    return Object.entries(userStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.completed - a.completed || b.rate - a.rate)
      .slice(0, 5); // Get top 5
  }, [tasks]);

  if (topUsers.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{t("topPerformers")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("topPerformersSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topUsers.map((user, index) => {
          let rankColor = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
          let Icon = Award;
          
          if (index === 0) {
            rankColor = "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500";
            Icon = Trophy;
          } else if (index === 1) {
            rankColor = "bg-slate-200 dark:bg-slate-400/20 text-slate-500 dark:text-slate-300";
            Icon = Medal;
          } else if (index === 2) {
            rankColor = "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500";
            Icon = Medal;
          }

          return (
            <div key={user.name} className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 transition-transform hover:scale-105 cursor-pointer">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${rankColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 text-center truncate w-full px-2">{user.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("rank")} {index + 1}</p>
              
              <div className="mt-3 w-full pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between px-2 text-sm">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-green-600 dark:text-green-500">{user.completed}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t("completed")}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-blue-600 dark:text-blue-500">{user.total}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t("tasksCount")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
