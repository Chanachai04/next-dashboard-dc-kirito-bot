"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { TasksTable, TaskData } from "./TasksTable";
import { TasksOverviewChart } from "./TasksOverviewChart";
import { Leaderboard } from "./Leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";
import { 
  RefreshCw, LayoutDashboard, CheckCircle2, Clock, ListTodo, 
  Percent, Search, Filter, Sun, Moon, Download
} from "lucide-react";

export function Dashboard() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTasks(data.tasks || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
    }, 10000); // Auto-refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate Summary Stats
  const { totalTasks, completedTasks, pendingTasks, completionRate } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "TRUE" || task.status?.toLowerCase() === "true" || task.status === "เสร็จแล้ว"
    ).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionRate: rate,
    };
  }, [tasks]);

  // Filter tasks for the table
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = 
        task.discord_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.task?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isCompleted = task.status === "TRUE" || task.status?.toLowerCase() === "true" || task.status === "เสร็จแล้ว";
      let matchesStatus = true;
      if (statusFilter === "completed") {
        matchesStatus = isCompleted;
      } else if (statusFilter === "pending") {
        matchesStatus = !isCompleted;
      }

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  // Export CSV
  const exportToCSV = () => {
    if (filteredTasks.length === 0) return;
    
    const headers = [t("name"), t("taskDetails"), t("deadline"), t("status")];
    
    const csvRows = filteredTasks.map(task => {
      return [
        `"${task.discord_name || ""}"`,
        `"${task.task || ""}"`,
        `"${task.deadline || ""}"`,
        `"${task.status || ""}"`
      ].join(",");
    });
    
    // UTF-8 BOM for Thai language support
    const csvString = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tasks_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("dashboardTitle")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardSubtitle")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Controls */}
          {mounted && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => setLanguage(language === "th" ? "en" : "th")}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Switch Language"
              >
                <span className="text-xs font-bold">{language.toUpperCase()}</span>
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          )}

          
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
          {error}
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <Card className="p-4 sm:p-6 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("totalTasks")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{totalTasks}</h2>
            </div>
            <div className="hidden sm:flex p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 sm:p-6 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("completedTasks")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{completedTasks}</h2>
            </div>
            <div className="hidden sm:flex p-2 sm:p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("pendingTasks")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{pendingTasks}</h2>
            </div>
            <div className="hidden sm:flex p-2 sm:p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("successRate")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{completionRate}%</h2>
            </div>
            <div className="hidden sm:flex p-2 sm:p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
              <Percent className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard Section */}
      <Leaderboard tasks={tasks} />

      {/* Main Charts & Table Area (50:50 Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Left Side: Chart */}
        <div className="w-full">
          <div className="h-full">
            <TasksOverviewChart tasks={tasks} />
          </div>
        </div>
        
        {/* Right Side: Table */}
        <div className="w-full flex flex-col h-full">
          <Card className="flex-1 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{t("ongoingTasks")}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("searchAndFilter")}</p>
                </div>
                <button
                  onClick={exportToCSV}
                  disabled={filteredTasks.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:cursor-pointer dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {t("exportCSV")}
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative w-full sm:w-[130px]">
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all"
                  >
                    <option value="all">{t("allStatus")}</option>
                    <option value="pending">{t("pending")}</option>
                    <option value="completed">{t("completed")}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scrollable Container with Hidden Scrollbar */}
            <CardContent className="p-0 flex-1 overflow-auto max-h-[500px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TasksTable tasks={filteredTasks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
