export interface Game {
  id: string
  title: string
  description: string
  apk_file: string
  screenshots: string[]
  tags: string[]
  download_count: number
  use_locker: boolean
  created_at: string
}