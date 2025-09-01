export type WallpaperType = 'main_pack' | 'desktop_pack' | 'mobile_pack' | 'desktop_sketchy_pack' | 'mobile_sketchy_pack'

export interface Wallpaper {
  id: string
  anime_id: string | null
  previews: Record<WallpaperType, string[]>
  download_links: Record<WallpaperType, string>
  pack_counts: Record<string, number>
  download_count: number
  created_at: string
  updated_at: string
  anime_series?: AnimeSeries | null
}

export interface AnimeSeries {
  id: string
  name: string
  description: string | null
  cover_image: string | null
  created_at: string
}