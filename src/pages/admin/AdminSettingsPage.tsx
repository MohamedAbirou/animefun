import { supabase } from "@/lib/supabase";
import { LockerSettings } from "@/types/settings";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<LockerSettings>({
    wallpapers_enabled: true,
    quizzes_enabled: true,
    games_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("global_settings")
        .select("value")
        .eq("key", "locker_settings")
        .single();

      if (error) throw error;

      setSettings(data.value as unknown as LockerSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("global_settings")
        .update({ value: settings as any })
        .eq("key", "locker_settings");

      await supabase
        .from("wallpapers")
        .update({ use_locker: settings.wallpapers_enabled })
        .eq("use_locker", !settings.wallpapers_enabled);

      await supabase
        .from("quizzes")
        .update({ use_locker: settings.quizzes_enabled })
        .eq("use_locker", !settings.quizzes_enabled);

      await supabase
        .from("games")
        .update({ use_locker: settings.games_enabled })
        .eq("use_locker", !settings.games_enabled);

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof LockerSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Global Settings
      </h1>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Content Locker Settings
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Wallpapers Locker
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable content locker for wallpaper downloads
              </p>
            </div>
            <button
              onClick={() => handleToggle("wallpapers_enabled")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.wallpapers_enabled
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.wallpapers_enabled
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Quizzes Locker
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable content locker for quiz results
              </p>
            </div>
            <button
              onClick={() => handleToggle("quizzes_enabled")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.quizzes_enabled
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.quizzes_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Games Locker
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable content locker for game downloads
              </p>
            </div>
            <button
              onClick={() => handleToggle("games_enabled")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.games_enabled
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.games_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
