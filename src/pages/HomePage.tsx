import { supabase } from "@/lib/supabase";
import { Game } from "@/types/game";
import { Quiz } from "@/types/quiz";
import { Wallpaper } from "@/types/wallpaper";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [featuredWallpapers, setFeaturedWallpapers] = useState<Wallpaper[]>([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      setIsLoading(true);

      try {
        // Fetch 3 random wallpapers
        const { data: wallpapers } = await supabase
          .from("wallpapers")
          .select("*, anime_series(id, name, description, cover_image)")
          .order("download_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(3);

        // Fetch 2 random quizzes
        const { data: quizzes } = await supabase
          .from("quizzes")
          .select("*, anime_series(id, name)")
          .order("completion_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2);

        // Fetch 2 random games
        const { data: games } = await supabase
          .from("games")
          .select("*")
          .order("download_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2);

        setFeaturedWallpapers((wallpapers as unknown as Wallpaper[]) || []);
        setFeaturedQuizzes((quizzes as unknown as Quiz[]) || []);
        setFeaturedGames((games as Game[]) || []);
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedContent();
    console.log("Is loading: ", isLoading);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 to-secondary-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7130555/pexels-photo-7130555.jpeg"
            alt="Anime background"
            className="object-cover w-full h-full opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700/80 to-secondary-900/80 mix-blend-multiply" />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to AnimeFun
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-blue-100">
            Explore amazing anime wallpapers, personality quizzes, and mobile
            games — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/wallpapers"
              className="btn bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-500/20 transition-all duration-200 transform hover:scale-105"
            >
              Explore Wallpapers
            </Link>
            <Link
              to="/quizzes"
              className="btn bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg shadow-secondary-500/20 transition-all duration-200 transform hover:scale-105"
            >
              Take a Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Wallpapers */}
      <section className="bg-white dark:bg-dark-bg py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Wallpapers
            </h2>
            <Link
              to="/wallpapers"
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredWallpapers.map((wallpaper) => (
                <Link
                  key={wallpaper.id}
                  to={`/wallpapers/${wallpaper.id}`}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  {wallpaper.anime_series?.cover_image && (
                    <img
                      loading="lazy"
                      src={wallpaper.anime_series.cover_image}
                      alt={wallpaper.anime_series.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      width="400"
                      height="300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {wallpaper.anime_series?.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {wallpaper.download_count} downloads
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-dark-card py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose AnimeFun?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Your one-stop destination for all things anime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-sidebar rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                HD Wallpapers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                High-quality wallpapers from your favorite anime series,
                available for both desktop and mobile.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-sidebar rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-secondary-600 dark:text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Personality Quizzes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Discover which anime character matches your personality with our
                fun and engaging quizzes.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-sidebar rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-accent-600 dark:text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Mobile Games
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Download exclusive anime-themed mobile games created by talented
                developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quizzes & Games */}
      <section className="bg-white dark:bg-dark-bg py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Quizzes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Popular Quizzes
                </h2>
                <Link
                  to="/quizzes"
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  View all →
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-200 dark:bg-gray-800 rounded-lg h-24 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredQuizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      to={`/quizzes/${quiz.id}`}
                      className="block bg-gray-50 dark:bg-dark-sidebar rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {quiz.anime_series?.name || "General"} •{" "}
                        {quiz.completion_count} completions
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {quiz.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Games */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Latest Games
                </h2>
                <Link
                  to="/games"
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  View all →
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-200 dark:bg-gray-800 rounded-lg h-24 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredGames.map((game) => (
                    <Link
                      key={game.id}
                      to={`/games/${game.id}`}
                      className="block bg-gray-50 dark:bg-dark-sidebar rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        General • {game.download_count} downloads
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {game.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent-600 to-primary-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to dive into the anime universe?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Explore our collection of wallpapers, quizzes, and games designed
            for true anime fans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/wallpapers"
              className="btn bg-white text-primary-700 hover:bg-gray-100 shadow-lg"
            >
              Browse Wallpapers
            </Link>
            <Link
              to="/quizzes"
              className="btn bg-accent-500 text-white hover:bg-accent-600 shadow-lg"
            >
              Start a Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
