import { supabase } from "@/lib/supabase";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Types
type DailyStat = {
  date: string;
  // dynamic keys for interaction types (e.g. wallpaper_download, game_download, locker_interaction...)
  [key: string]: string | number;
};

interface StatsState {
  totalDownloads: number;
  totalCompletions: number;
  recentActivity: any[]; // keep as any for simplicity; can be typed more strictly
  downloadsByType: Record<string, number>;
  dailyStats: DailyStat[];
}

const AdminStatsPage = () => {
  const [stats, setStats] = useState<StatsState>({
    totalDownloads: 0,
    totalCompletions: 0,
    recentActivity: [],
    downloadsByType: {},
    dailyStats: [],
  });

  const [dateRange, setDateRange] = useState<
    "7d" | "30d" | "6m" | "1y" | "all"
  >("7d");

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadStats = async () => {
    try {
      // Get date range
      const now = new Date();
      let startDate: Date | null = null;

      switch (dateRange) {
        case "7d":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case "6m":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "all":
        default:
          startDate = null;
      }

      // Fetch stats
      let query = supabase.from("stats").select("*");

      if (startDate) query = query.gte("created_at", startDate.toISOString());

      const { data: statsDataRaw, error: statsError } = await query.order(
        "created_at",
        { ascending: false }
      );

      if (statsError) throw statsError;

      const statsData = statsDataRaw ?? [];

      // 🧮 process stats
      const byType = statsData.reduce(
        (acc: Record<string, number>, curr: any) => {
          const t = curr.interaction_type ?? "unknown";
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        },
        {}
      );

      // All observed types (keeps order consistent between charts)
      const allTypes: string[] = Object.keys(byType);

      // Group by date & type
      const byDate: Record<string, Record<string, number>> = statsData.reduce(
        (acc, curr: any) => {
          const date = format(new Date(curr.created_at), "yyyy-MM-dd");
          if (!acc[date]) acc[date] = {};
          const type = curr.interaction_type ?? "unknown";
          acc[date][type] = (acc[date][type] || 0) + 1;
          return acc;
        },
        {} as Record<string, Record<string, number>>
      );

      // Sorted list of dates (chronological)
      const sortedDates = Object.keys(byDate).sort((a, b) =>
        a.localeCompare(b)
      );

      // Build dailyStats with zeros for missing types so each row has the same shape
      const dailyStats: DailyStat[] = sortedDates.map((date) => {
        const row: DailyStat = { date };
        for (const type of allTypes) {
          row[type] = byDate[date][type] || 0;
        }
        return row;
      });

      // Totals
      const totalDownloads = Object.entries(byType).reduce(
        (sum, [key, val]) => {
          return key.includes("download") ? sum + val : sum;
        },
        0
      );
      const totalCompletions = byType["quiz_completion"] || 0;

      setStats({
        totalDownloads,
        totalCompletions,
        recentActivity: statsData.slice(0, 10),
        downloadsByType: byType,
        dailyStats,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading stats:", error);
    }
  };

  // Derive chart datasets from the processed state
  const types: string[] = Object.keys(stats.downloadsByType);

  const colors = [
    "rgb(99, 102, 241)",
    "rgb(244, 63, 94)",
    "rgb(34, 197, 94)",
    "rgb(234, 179, 8)",
    "rgb(59, 130, 246)",
    "rgb(168, 85, 247)",
  ];

  const labels = stats.dailyStats.map((s) => format(new Date(s.date), "MMM d"));

  const lineChartData = {
    labels,
    datasets: types.map((type, i) => ({
      label: type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      data: stats.dailyStats.map((s) => Number(s[type] || 0)),
      borderColor: colors[i % colors.length],
      tension: 0.2,
      fill: false,
      pointRadius: 3,
    })),
  };

  const pieChartData = {
    labels: types.map((t) =>
      t
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    ),
    datasets: [
      {
        data: types.map((t) => stats.downloadsByType[t] || 0),
        backgroundColor: types.map((_, i) => colors[i % colors.length]),
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Statistics
        </h1>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="select-input"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last Month</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Downloads
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {stats.totalDownloads}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quiz Completions
          </h3>
          <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
            {stats.totalCompletions}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Over Time
          </h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Interactions by Type
          </h3>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">
                  Type
                </th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">
                  Item ID
                </th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">
                  Session
                </th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 text-gray-900 dark:text-white">
                    {activity.interaction_type
                      .split("_")
                      .map(
                        (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                      )
                      .join(" ")}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {activity.item_id}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {activity.session_id}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {format(new Date(activity.created_at), "MMM d, yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;
