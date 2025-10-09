import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { useWallpaperStore } from "@/store/wallpaperStore";
import { Wallpaper, WallpaperType } from "@/types/wallpaper";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Helper to get optimized Supabase image URL
const getPreviewUrl = (path: string, width = 600, quality = 70) => {
  const { data } = supabase.storage.from("wallpapers").getPublicUrl(path);
  if (!data?.publicUrl) return "";

  // Add resize params for better performance (no Pro plan required)
  return `${data.publicUrl}?width=${width}&quality=${quality}`;
};

export default function WallpaperDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchWallpaperById, downloadWallpaper } = useWallpaperStore();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadWallpaper = async () => {
      if (!id) {
        navigate("/wallpapers");
        return;
      }

      const wallpaperData = await fetchWallpaperById(id);

      if (wallpaperData) {
        setWallpaper(wallpaperData);
        // Set first type as default selected
        const types = Object.keys(wallpaperData.previews);
        if (types.length > 0) {
          setSelectedType(types[0]);
        }
      }

      setIsLoading(false);
    };

    loadWallpaper();
  }, [id, navigate, fetchWallpaperById]);

  // Handle image loading state
  const handleImageLoad = (type: string) => {
    setLoadingImages((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  // Start loading state when type changes
  useEffect(() => {
    if (selectedType) {
      setLoadingImages((prev) => ({
        ...prev,
        [selectedType]: true,
      }));
      setPreviewImage(null); // Reset preview when changing type
    }
  }, [selectedType]);

  const handleDownload = async (type: string) => {
    if (!wallpaper) return;

    await downloadWallpaper(wallpaper, type);
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!wallpaper) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Wallpaper not found
        </h2>
        <button
          onClick={() => navigate("/wallpapers")}
          className="btn btn-primary"
        >
          Back to Wallpapers
        </button>
      </div>
    );
  }

  const getPackCount = (type: string) => {
    const countKey = `${type.toLowerCase()}_count`;
    return wallpaper.pack_counts?.[countKey] || 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with title and main download button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {wallpaper.anime_series?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {wallpaper.download_count} downloads
            </p>
          </div>

          <button
            onClick={() => handleDownload("main")}
            className="btn btn-primary"
          >
            Download Main Pack ({getPackCount("main")})
          </button>
        </div>

        {/* Type Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4">
              {Object.keys(wallpaper.previews).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={clsx(
                    "py-2 text-sm font-medium border-b-2 transition-colors",
                    selectedType === type
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  {type.replace(/_/g, " ")} ({getPackCount(type)})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Preview Images */}
        <div className="space-y-4">
          {wallpaper.previews[selectedType as WallpaperType]?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {wallpaper.previews[selectedType as WallpaperType]?.map(
                (preview: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-[16/9] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openPreview(preview)}
                  >
                    {loadingImages[selectedType] && (
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    )}
                    <img
                      src={getPreviewUrl(preview, 600, 70) || "/fallback.jpg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={() => handleImageLoad(selectedType)}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 border-2 border-double border-gray-300 dark:border-gray-700 rounded-xl transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v11.25m-18 0v1.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-1.5m-18 0l4.72-4.72a.75.75 0 011.06 0L12 16.5l3.22-3.22a.75.75 0 011.06 0L21 16.5"
                />
              </svg>
              <p className="text-lg font-medium">No previews available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Check back later — previews will be added soon.
              </p>
            </div>
          )}
        </div>

        {/* Download button for current type */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleDownload(selectedType)}
            className="btn btn-primary"
          >
            Download {selectedType.replace(/_/g, " ")} Pack (
            {getPackCount(selectedType)})
          </button>
        </div>
      </div>

      {/* Full-screen Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh]">
            <img
              src={getPreviewUrl(previewImage, 600, 70) ?? "/fallback.jpg"}
              alt="Preview"
              className="w-full h-full object-contain"
              loading="lazy"
              onLoad={() => handleImageLoad(selectedType)}
              onError={(e) => {
                e.currentTarget.src = "/fallback.jpg";
              }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
