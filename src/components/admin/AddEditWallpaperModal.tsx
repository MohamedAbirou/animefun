import { supabase } from "@/lib/supabase";
import { Wallpaper } from "@/types/wallpaper";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallpaper?: Wallpaper;
  onSuccess: () => void;
}

interface WallpaperFormData {
  anime_id: string;
  previews: Record<string, string[]>;
  download_links: Record<string, string>;
  pack_counts: Record<string, number>;
}

const WALLPAPER_TYPES = [
  "desktop",
  "mobile",
  "desktop_sketchy",
  "mobile_sketchy",
] as const;

export default function AddEditWallpaperModal({
  isOpen,
  onClose,
  wallpaper,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<WallpaperFormData>({
    defaultValues: wallpaper
      ? {
          anime_id: wallpaper.anime_id || "",
          previews: wallpaper.previews || {},
          download_links: wallpaper.download_links || {},
          pack_counts: wallpaper.pack_counts || {
            main_count: 0,
            desktop_count: 0,
            mobile_count: 0,
            desktop_sketchy_count: 0,
            mobile_sketchy_count: 0,
          },
        }
      : {
          anime_id: "",
          previews: {},
          download_links: {},
          pack_counts: {
            main_count: 0,
            desktop_count: 0,
            mobile_count: 0,
            desktop_sketchy_count: 0,
            mobile_sketchy_count: 0,
          },
        },
  });

  useEffect(() => {
    if (wallpaper) {
      reset({
        anime_id: wallpaper.anime_id || "",
        previews: wallpaper.previews || {},
        download_links: wallpaper.download_links || {},
        pack_counts: wallpaper.pack_counts || {
          main_count: 0,
          desktop_count: 0,
          mobile_count: 0,
          desktop_sketchy_count: 0,
          mobile_sketchy_count: 0,
        },
      });
    } else {
      reset({
        anime_id: "",
        previews: {},
        download_links: {},
        pack_counts: {
          main_count: 0,
          desktop_count: 0,
          mobile_count: 0,
          desktop_sketchy_count: 0,
          mobile_sketchy_count: 0,
        },
      });
    }
  }, [wallpaper, reset]);

  const fetchSeries = async () => {
    const { data, error } = await supabase.from("anime_series").select("*");
    if (error) {
      toast.error("Failed to fetch anime series");
    } else {
      setSeries(data);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const previews = useWatch({
    control,
    name: "previews",
    defaultValue: {},
  });

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
      const files = e.target.files;
      if (!files || files.length !== 6) {
        toast.error("Please select exactly 6 preview images");
        return;
      }

      try {
        setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
        const totalFiles = files.length;
        let completedUploads = 0;

        const uploadPromises = Array.from(files).map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `previews/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("wallpapers")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Update progress after each file completes
          completedUploads++;
          const progress = (completedUploads / totalFiles) * 100;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));

          return filePath;
        });

        const paths = await Promise.all(uploadPromises);

        setValue(`previews.${type}`, paths, { shouldDirty: true });
        setExpandedType(type);
        toast.success(`${type} previews uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload previews");
      } finally {
        setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
      }
    },
    [setValue]
  );

  const togglePreviewSection = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const renderPreviewThumbnails = (type: string) => {
    if (!previews[type]?.length || expandedType !== type) return null;

    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
        {previews[type].map((path: string, index: number) => (
          <div
            key={index}
            className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
          >
            <img
              loading="lazy"
              src={`${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/public/wallpapers/${path}`}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  const onSubmit = async (data: WallpaperFormData) => {
    try {
      setIsSubmitting(true);

      // Validate download links and counts
      const downloadLinks: Record<string, string> = {};
      const packCounts: Record<string, number> = {};

      const packs = [
        ["main_pack", "main_count"],
        ["desktop_pack", "desktop_count"],
        ["mobile_pack", "mobile_count"],
        ["desktop_sketchy_pack", "desktop_sketchy_count"],
        ["mobile_sketchy_pack", "mobile_sketchy_count"],
      ];

      for (const [linkKey, countKey] of packs) {
        const link = data.download_links[linkKey];
        const count = data.pack_counts[countKey];

        if (!link?.startsWith("https://mega.nz/")) {
          throw new Error(
            `${linkKey.replace("_", " ")} must be a valid Mega.nz link`
          );
        }

        if (count < 0) {
          throw new Error(
            `${countKey.replace("_", " ")} must be a positive number`
          );
        }

        downloadLinks[linkKey] = link;
        packCounts[countKey] = count;
      }

      // Validate previews
      // for (const type of WALLPAPER_TYPES) {
      //   if (!data.previews[type] || data.previews[type].length < 6) {
      //     throw new Error(
      //       `Must upload exactly 6 preview images for ${type.replace("_", " ")}`
      //     );
      //   }
      // }

      if (wallpaper) {
        const { error } = await supabase
          .from("wallpapers")
          .update(data)
          .eq("id", wallpaper.id);

        if (error) throw error;
        toast.success("Wallpaper updated successfully");
      } else {
        const { error } = await supabase.from("wallpapers").insert(data);

        if (error) throw error;
        toast.success("Wallpaper created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving wallpaper:", error);
      toast.error(error.message || "Failed to save wallpaper");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {wallpaper ? "Edit Wallpaper" : "Add New Wallpaper"}
                </Dialog.Title>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-4 space-y-6"
                >
                  {/* Anime Series Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Anime Series
                    </label>
                    <select
                      {...register("anime_id", {
                        required: "Anime series is required",
                      })}
                      className="form-input"
                    >
                      <option value="">Select a series</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors.anime_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.anime_id.message}
                      </p>
                    )}
                  </div>

                  {/* Preview Images */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Preview Images
                    </h4>
                    {WALLPAPER_TYPES.map((type) => (
                      <div
                        key={type}
                        className="border dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => togglePreviewSection(type)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="font-medium capitalize">
                            {type.replace("_", " ")} Previews
                            {previews[type]?.length > 0 && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({previews[type].length} images)
                              </span>
                            )}
                          </span>
                          {expandedType === type ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>

                        {expandedType === type && (
                          <div className="p-4">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleFileUpload(e, type)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />

                            {uploadProgress[type] > 0 &&
                              uploadProgress[type] < 100 && (
                                <div className="mt-2">
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary-600 transition-all duration-300"
                                      style={{
                                        width: `${uploadProgress[type]}%`,
                                      }}
                                    />
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Uploading...{" "}
                                    {Math.round(uploadProgress[type])}%
                                  </p>
                                </div>
                              )}

                            {renderPreviewThumbnails(type)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Download Links and Pack Counts */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Download Links & Pack Information
                    </h4>
                    <div className="space-y-4">
                      {[
                        ["main_pack", "main_count", "Main Pack"],
                        ["desktop_pack", "desktop_count", "Desktop Pack"],
                        ["mobile_pack", "mobile_count", "Mobile Pack"],
                        [
                          "desktop_sketchy_pack",
                          "desktop_sketchy_count",
                          "Desktop Sketchy Pack",
                        ],
                        [
                          "mobile_sketchy_pack",
                          "mobile_sketchy_count",
                          "Mobile Sketchy Pack",
                        ],
                      ].map(([linkKey, countKey, label]) => (
                        <div key={linkKey} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                {...register(`download_links.${linkKey}`, {
                                  required: `${label} link is required`,
                                  pattern: {
                                    value: /^https:\/\/mega\.nz\/.+/,
                                    message: "Must be a valid Mega.nz link",
                                  },
                                })}
                                placeholder="https://mega.nz/..."
                                className="form-input"
                              />
                              {errors.download_links?.[linkKey] && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.download_links[linkKey].message}
                                </p>
                              )}
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                {...register(`pack_counts.${countKey}`, {
                                  required: `${label} count is required`,
                                  min: {
                                    value: 0,
                                    message: "Count must be 0 or greater",
                                  },
                                })}
                                placeholder="Number of wallpapers"
                                className="form-input"
                              />
                              {errors.pack_counts?.[countKey] && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.pack_counts[countKey].message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
