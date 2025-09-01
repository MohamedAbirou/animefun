import { supabase } from "@/lib/supabase";
import {
  ChartBarIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalWallpapers: number;
  totalQuizzes: number;
  totalGames: number;
  totalAdmins: number;
  wallpaperDownloads: number;
  quizCompletions: number;
  gameDownloads: number;
}

interface RecentActivity {
  type:
    | "wallpaper_download"
    | "quiz_completion"
    | "game_download";
  item_id: string;
  created_at: string;
  itemName?: string;
}

type PeriodFilter =
  | "today"
  | "yesterday"
  | "7d"
  | "14d"
  | "30d"
  | "90d"
  | "all";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWallpapers: 0,
    totalQuizzes: 0,
    totalGames: 0,
    totalAdmins: 0,
    wallpaperDownloads: 0,
    quizCompletions: 0,
    gameDownloads: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("7d");
  const [interactionChanges, setInteractionChanges] = useState<
    Record<string, number>
  >({});

  // Get date range based on selected period
  const getDateRange = (period: PeriodFilter): [Date, Date] => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "14d":
        startDate.setDate(now.getDate() - 14);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate.setFullYear(startDate.getFullYear() - 10); // Everything
        break;
    }

    return [startDate, endDate];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const [currentStart, currentEnd] = getDateRange(selectedPeriod);
        const previousStart = new Date(currentStart);
        previousStart.setDate(
          previousStart.getDate() -
            currentStart.getDate() +
            currentEnd.getDate()
        );

        const [
          { count: wallpaperCount },
          { count: quizCount },
          { count: gameCount },
          { count: adminCount },
          { data: recentActivityData },
        ] = await Promise.all([
          supabase
            .from("wallpapers")
            .select("*", { count: "exact", head: true }),
          supabase.from("quizzes").select("*", { count: "exact", head: true }),
          supabase.from("games").select("*", { count: "exact", head: true }),
          supabase
            .from("admin_profiles")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("stats")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        // Utility function to get count of interaction in date range
        const getInteractionCount = async (
          type: string,
          from: Date,
          to: Date
        ) => {
          const { count } = await supabase
            .from("stats")
            .select("*", { count: "exact", head: true })
            .eq("interaction_type", type)
            .gte("created_at", from.toISOString())
            .lt("created_at", to.toISOString());

          return count || 0;
        };

        // Calculate interactions for current and previous periods
        const interactionTypes = [
          "wallpaper_download",
          "quiz_completion",
          "game_download",
        ];

        const interactionCounts = await Promise.all(
          interactionTypes.map(async (type) => {
            const current = await getInteractionCount(
              type,
              currentStart,
              currentEnd
            );
            const previous = await getInteractionCount(
              type,
              previousStart,
              currentStart
            );

            // Calculate percentage change, capped at 100%
            const rawChange =
              previous === 0
                ? current > 0
                  ? 100
                  : 0
                : ((current - previous) / previous) * 100;

            const change = Math.min(Math.max(rawChange, -100), 100);

            return { type, current, previous, change };
          })
        );

        const wallpaperDownloads =
          interactionCounts.find((i) => i.type === "wallpaper_download")
            ?.current || 0;
        const quizCompletions =
          interactionCounts.find((i) => i.type === "quiz_completion")
            ?.current || 0;
        const gameDownloads =
          interactionCounts.find((i) => i.type === "game_download")?.current ||
          0;

        // Update stats
        setStats({
          totalWallpapers: wallpaperCount || 0,
          totalQuizzes: quizCount || 0,
          totalGames: gameCount || 0,
          totalAdmins: adminCount || 0,
          wallpaperDownloads,
          quizCompletions,
          gameDownloads,
        });

        // Set percentage changes
        setInteractionChanges({
          wallpaper_download:
            interactionCounts.find((i) => i.type === "wallpaper_download")
              ?.change || 0,
          quiz_completion:
            interactionCounts.find((i) => i.type === "quiz_completion")
              ?.change || 0,
          game_download:
            interactionCounts.find((i) => i.type === "game_download")?.change ||
            0,
        });

        // Process recent activity
        const activity = recentActivityData || [];
        const enrichedActivity = await Promise.all(
          activity.map(async (item: any) => {
            let itemName = "Unknown";

            if (item.interaction_type === "wallpaper_download") {
              const { data } = await supabase
                .from("wallpapers")
                .select("anime_series(id, name)")
                .eq("id", item.item_id)
                .single();
              itemName = data?.anime_series?.name || "Unknown wallpaper";
            } else if (item.interaction_type === "quiz_completion") {
              const { data } = await supabase
                .from("quizzes")
                .select("title")
                .eq("id", item.item_id)
                .single();
              itemName = data?.title || "Unknown quiz";
            } else if (item.interaction_type === "game_download") {
              const { data } = await supabase
                .from("games")
                .select("title")
                .eq("id", item.item_id)
                .single();
              itemName = data?.title || "Unknown game";
            }

            return {
              type: item.interaction_type as RecentActivity["type"],
              item_id: item.item_id,
              created_at: item.created_at,
              itemName,
            };
          })
        );

        setRecentActivity(enrichedActivity);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  const statsItems = [
    {
      name: "Total Wallpapers",
      value: stats.totalWallpapers,
      icon: PhotoIcon,
      color: "bg-pink-500",
      link: "/admin/wallpapers",
    },
    {
      name: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: QuestionMarkCircleIcon,
      color: "bg-blue-500",
      link: "/admin/quizzes",
    },
    {
      name: "Total Games",
      value: stats.totalGames,
      icon: PuzzlePieceIcon,
      color: "bg-green-500",
      link: "/admin/games",
    },
    {
      name: "Admin Users",
      value: stats.totalAdmins,
      icon: UsersIcon,
      color: "bg-purple-500",
      link: "/admin/users",
    },
  ];

  const interactionItems = [
    {
      name: "Wallpaper Downloads",
      value: stats.wallpaperDownloads,
      icon: PhotoIcon,
      color: "bg-pink-400",
      change: `${interactionChanges.wallpaper_download?.toFixed(1) ?? 0}%`,
    },
    {
      name: "Quiz Completions",
      value: stats.quizCompletions,
      icon: QuestionMarkCircleIcon,
      color: "bg-blue-400",
      change: `${interactionChanges.quiz_completion?.toFixed(1) ?? 0}%`,
    },
    {
      name: "Game Downloads",
      value: stats.gameDownloads,
      icon: PuzzlePieceIcon,
      color: "bg-green-400",
      change: `${interactionChanges.game_download?.toFixed(1) ?? 0}%`,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "wallpaper_download":
        return <PhotoIcon className="h-5 w-5 text-pink-500" />;
      case "quiz_completion":
        return <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />;
      case "game_download":
        return <PuzzlePieceIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "wallpaper_download":
        return `Wallpaper "${activity.itemName}" was downloaded`;
      case "quiz_completion":
        return `Quiz "${activity.itemName}" was completed`;
      case "game_download":
        return `Game "${activity.itemName}" was downloaded`;
      default:
        return "Unknown activity";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome to your admin dashboard. Here's an overview of your
            platform.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Time Period:
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
            className="form-input py-1 pl-2 pr-8"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Content Stats */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Content Overview
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsItems.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="bg-white dark:bg-dark-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon
                      className="h-6 w-6 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {item.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isLoading ? (
                            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ) : (
                            item.value
                          )}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Interactions Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Interactions
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {interactionItems.map((item) => (
            <div
              key={item.name}
              className="bg-white dark:bg-dark-card overflow-hidden rounded-lg shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-md ${item.color}`}>
                      <item.icon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isLoading ? (
                            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ) : (
                            item.value
                          )}
                        </div>
                        {!isLoading && (
                          <span
                            className={`ml-2 text-sm font-medium ${
                              parseFloat(item.change) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {item.change}
                          </span>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="mt-2 bg-white dark:bg-dark-card shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No recent activity to display
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/wallpapers"
            className="block bg-white dark:bg-dark-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-center">
              <PhotoIcon className="h-6 w-6 text-pink-500" />
              <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">
                Add New Wallpaper
              </span>
            </div>
          </Link>

          <Link
            to="/admin/quizzes"
            className="block bg-white dark:bg-dark-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">
                Create New Quiz
              </span>
            </div>
          </Link>

          <Link
            to="/admin/games"
            className="block bg-white dark:bg-dark-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-center">
              <PuzzlePieceIcon className="h-6 w-6 text-green-500" />
              <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">
                Add New Game
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
