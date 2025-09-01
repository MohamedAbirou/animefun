import { supabase, trackInteraction } from "@/lib/supabase";
import { AnimeSeries, Wallpaper, WallpaperType } from "@/types/wallpaper";
import toast from "react-hot-toast";
import { create } from "zustand";

interface WallpaperFilters {
  type?: WallpaperType;
  seriesId?: string;
  query?: string;
}

interface WallpaperState {
  wallpapers: Wallpaper[];
  series: AnimeSeries[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  filters: WallpaperFilters;

  fetchWallpapers: (
    page?: number,
    filters?: Partial<WallpaperFilters>
  ) => Promise<void>;
  fetchWallpaperById: (id: string) => Promise<Wallpaper | null>;
  fetchSeries: () => Promise<void>;

  // download
  downloadWallpaper: (wallpaper: Wallpaper, type: string) => Promise<void>;

  // Admin functions
  createWallpaper: (
    wallpaper: Omit<Wallpaper, "id" | "created_at">
  ) => Promise<boolean>;
  updateWallpaper: (
    id: string,
    updates: Partial<Wallpaper>
  ) => Promise<boolean>;
  deleteWallpaper: (id: string) => Promise<boolean>;
}

const ITEMS_PER_PAGE = 12;

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpapers: [],
  series: [],
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  filters: {},

  fetchWallpapers: async (page = 1, filters = {}) => {
    try {
      set({ isLoading: true });

      const updatedFilters = { ...get().filters, ...filters };

      let seriesIds: string[] = [];

      if (updatedFilters.query) {
        // Step 1: Search series by name
        const { data: matchingSeries, error: seriesError } = await supabase
          .from("anime_series")
          .select("id")
          .ilike("name", `%${updatedFilters.query}%`);

        if (seriesError) throw seriesError;

        seriesIds = matchingSeries?.map((s) => s.id) || [];

        // If no series matches, no wallpapers should show
        if (seriesIds.length === 0) {
          set({
            wallpapers: [],
            isLoading: false,
            currentPage: 1,
            totalPages: 0,
            filters: updatedFilters,
          });
          return;
        }
      }

      let query = supabase
        .from("wallpapers")
        .select("*, anime_series(id, name, cover_image)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (updatedFilters.seriesId) {
        query = query.eq("anime_id", updatedFilters.seriesId);
      }

      if (updatedFilters.type) {
        const jsonKey = updatedFilters.type
          .replace("_pack", "") // 'desktop_sketchy_pack' => 'desktop_sketchy'
          .replace("main", "desktop");

        query = query.filter(`previews->${jsonKey}`, "not.is", null);
      }

      if (seriesIds.length > 0) {
        query = query.in("anime_id", seriesIds);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

      set({
        wallpapers: data as unknown as Wallpaper[],
        isLoading: false,
        currentPage: page,
        totalPages,
        filters: updatedFilters,
      });
    } catch (error) {
      console.error("Failed to fetch wallpapers:", error);
      set({ isLoading: false });
      toast.error("Failed to load wallpapers");
    }
  },

  fetchWallpaperById: async (id) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase
        .from("wallpapers")
        .select("*, anime_series(id, name)")
        .eq("id", id)
        .single();

      set({ isLoading: false });

      if (error) throw error;

      return data as unknown as Wallpaper;
    } catch (error) {
      console.error("Failed to fetch wallpaper:", error);
      set({ isLoading: false });
      toast.error("Failed to load wallpaper");
      return null;
    }
  },

  fetchSeries: async () => {
    try {
      const { data, error } = await supabase
        .from("anime_series")
        .select("*")
        .order("name");

      if (error) throw error;

      set({ series: data as AnimeSeries[] });
    } catch (error) {
      console.error("Failed to fetch anime series:", error);
      toast.error("Failed to load anime series");
    }
  },

  downloadWallpaper: async (wallpaper, type) => {
    try {

      // Determine the download URL based on type
      let downloadUrl = "";
      switch (type) {
        case "main":
          downloadUrl = wallpaper.download_links.main_pack;
          break;
        case "desktop":
          downloadUrl = wallpaper.download_links.desktop_pack;
          break;
        case "mobile":
          downloadUrl = wallpaper.download_links.mobile_pack;
          break;
        case "desktop_sketchy":
          downloadUrl = wallpaper.download_links.desktop_sketchy_pack;
          break;
        case "mobile_sketchy":
          downloadUrl = wallpaper.download_links.mobile_sketchy_pack;
          break;
        default:
          throw new Error("Invalid download type");
      }

      if (!downloadUrl || !downloadUrl.startsWith("http")) {
        throw new Error("Invalid wallpaper URL");
      }

      // Increment usage
      await incrementUsage('wallpaper_download');

      // Track interaction
      await trackInteraction("wallpaper_download", wallpaper.id);

      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = wallpaper.anime_series?.name || "wallpaper";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Downloading wallpaper...");
    } catch (error) {
      console.error("Failed to download wallpaper:", error);
      toast.error("Failed to download wallpaper");
    }
  },

  // Admin functions
  createWallpaper: async (wallpaper) => {
    try {
      const { error } = await supabase
        .from("wallpapers")
        .insert(wallpaper)
        .select("id")
        .single();

      if (error) throw error;

      // Refresh wallpapers list
      get().fetchWallpapers();

      toast.success("Wallpaper created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create wallpaper:", error);
      toast.error("Failed to create wallpaper");
      return false;
    }
  },

  updateWallpaper: async (id, updates) => {
    try {
      const { error } = await supabase
        .from("wallpapers")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        wallpapers: state.wallpapers.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
      }));

      toast.success("Wallpaper updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update wallpaper:", error);
      toast.error("Failed to update wallpaper");
      return false;
    }
  },

  deleteWallpaper: async (id) => {
    try {
      const { error } = await supabase.from("wallpapers").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        wallpapers: state.wallpapers.filter((w) => w.id !== id),
      }));

      toast.success("Wallpaper deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete wallpaper:", error);
      toast.error("Failed to delete wallpaper");
      return false;
    }
  },
}));