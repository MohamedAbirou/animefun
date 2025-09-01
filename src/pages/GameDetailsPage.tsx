import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { Game } from "@/types/game";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setGame(data);
    } catch (error) {
      console.error("Error fetching game:", error);
      toast.error("Failed to load game");
      navigate("/games");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!game) return;

    try {
      // Track download
      await supabase.from("stats").insert({
        interaction_type: "game_download",
        item_id: game.id,
        session_id: localStorage.getItem("session_id"),
      });

      // Update download count
      await supabase
        .from("games")
        .update({ download_count: (game.download_count || 0) + 1 })
        .eq("id", game.id);

      // Trigger download
      const link = document.createElement("a");
      link.href = game.apk_file;
      link.target = "_blank";
      link.download = `${game.title}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Downloading game...");
    } catch (error) {
      console.error("Error downloading game:", error);
      toast.error("Failed to download game");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Game not found
        </h2>
        <button onClick={() => navigate("/games")} className="btn btn-primary">
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with title and main download button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {game.title}
            </h1>
          </div>
        </div>

        {/* Screenshots Carousel */}
        <div className="relative mb-8">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={`${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/public/games/${
                game.screenshots[currentImage]
              }`}
              alt={`Screenshot ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Left arrow */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === 0 ? game.screenshots.length - 1 : prev - 1
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === game.screenshots.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

          <div className="absolute left-0 right-0 bottom-4 flex justify-center space-x-2">
            {game.screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full ${
                  currentImage === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Game Details */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6">
          <div className="prose dark:prose-invert max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-4">About This Game</h2>
            <p>{game.description}</p>
          </div>

          {game.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {game.download_count} downloads
            </div>

            <button onClick={handleDownload} className="btn btn-primary">
              Download APK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;
