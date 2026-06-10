import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/components/providers/I18nProvider";

export type TaskData = {
  discord_name: string;
  task: string;
  deadline: string;
  status: string;
};

interface TasksTableProps {
  tasks: TaskData[];
}

type SortField = "discord_name" | "deadline" | "status" | null;
type SortDirection = "asc" | "desc";

function getDeadlineStatus(deadlineStr: string, isCompleted: boolean) {
  if (isCompleted || !deadlineStr) return null;
  
  // Attempt to parse standard dates (YYYY-MM-DD or DD/MM/YYYY)
  const parts = deadlineStr.split(/[-/]/);
  let dateObj: Date;
  
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    if (p0 > 31) {
      dateObj = new Date(p0, p1 - 1, p2); // YYYY-MM-DD
    } else {
      dateObj = new Date(p2, p1 - 1, p0); // DD/MM/YYYY
    }
  } else {
    dateObj = new Date(deadlineStr);
  }

  if (isNaN(dateObj.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare to start of today
  const timeDiff = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return null;
}

// Helper to parse dates for sorting
function parseDateForSort(deadlineStr: string) {
  if (!deadlineStr) return new Date(8640000000000000).getTime(); // max date for empty
  const parts = deadlineStr.split(/[-/]/);
  let dateObj: Date;
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    if (p0 > 31) {
      dateObj = new Date(p0, p1 - 1, p2); 
    } else {
      dateObj = new Date(p2, p1 - 1, p0); 
    }
  } else {
    dateObj = new Date(deadlineStr);
  }
  return isNaN(dateObj.getTime()) ? new Date(8640000000000000).getTime() : dateObj.getTime();
}

export function TasksTable({ tasks }: TasksTableProps) {
  const { t } = useI18n();

  // Sorting State
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle Sort Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const isCompletedTask = (status: string) => {
    return status === "TRUE" || status?.toLowerCase() === "true" || status === "เสร็จแล้ว";
  };

  // Process Sorted Tasks
  const sortedTasks = useMemo(() => {
    if (!sortField) return tasks;

    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "discord_name") {
        comparison = (a.discord_name || "").localeCompare(b.discord_name || "");
      } else if (sortField === "deadline") {
        const timeA = parseDateForSort(a.deadline);
        const timeB = parseDateForSort(b.deadline);
        comparison = timeA - timeB;
      } else if (sortField === "status") {
        const statusA = isCompletedTask(a.status) ? 1 : 0;
        const statusB = isCompletedTask(b.status) ? 1 : 0;
        comparison = statusA - statusB;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tasks, sortField, sortDirection]);

  // Process Paginated Tasks
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="ml-2 h-4 w-4 inline-block text-slate-400" />;
    return sortDirection === "asc" ? 
      <ChevronUp className="ml-2 h-4 w-4 inline-block text-blue-500" /> : 
      <ChevronDown className="ml-2 h-4 w-4 inline-block text-blue-500" />;
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="w-full flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 shadow-sm">
            <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead 
                className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                onClick={() => handleSort("discord_name")}
              >
                {t("name")} {renderSortIcon("discord_name")}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">{t("taskDetails")}</TableHead>
              <TableHead 
                className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                onClick={() => handleSort("deadline")}
              >
                {t("deadline")} {renderSortIcon("deadline")}
              </TableHead>
              <TableHead 
                className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                {t("status")} {renderSortIcon("status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {t("noTasks")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task, index) => {
                const isCompleted = isCompletedTask(task.status);
                const deadlineStatus = getDeadlineStatus(task.deadline, isCompleted);
                
                let rowClassName = "transition-colors border-b border-slate-100 dark:border-slate-800/60 ";
                if (deadlineStatus === "overdue") {
                  rowClassName += "bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100/80 dark:hover:bg-red-900/40";
                } else if (deadlineStatus === "soon") {
                  rowClassName += "bg-yellow-50/80 dark:bg-yellow-950/30 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40";
                } else {
                  rowClassName += "hover:bg-slate-50/50 dark:hover:bg-slate-800/50";
                }

                return (
                  <TableRow key={index} className={rowClassName}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 max-w-[120px] sm:max-w-[180px] md:max-w-[250px]">
                      <div className="relative group cursor-pointer">
                        <div className="truncate w-full">{task.discord_name}</div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] sm:max-w-[300px] px-3 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded shadow-xl z-[60] whitespace-normal text-center break-words">
                          {task.discord_name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300 max-w-[150px] sm:max-w-[250px] md:max-w-[350px]">
                      <div className="relative group cursor-pointer">
                        <div className="truncate w-full">{task.task}</div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[250px] sm:max-w-md px-3 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded shadow-xl z-[60] whitespace-normal text-left break-words">
                          {task.task}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {task.deadline}
                        {deadlineStatus === "overdue" && (
                          <div className="relative group cursor-pointer flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded shadow-lg z-50">
                              {t("overdueTooltip")}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                            </div>
                          </div>
                        )}
                        {deadlineStatus === "soon" && (
                          <div className="relative group cursor-pointer flex items-center">
                            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded shadow-lg z-50">
                              {t("dueSoonTooltip")}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20 shadow-none">
                          {t("completed")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 shadow-none">
                          {t("pending")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="w-full flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t("page")} {currentPage} {t("of")} {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("previous")}
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t("next")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
