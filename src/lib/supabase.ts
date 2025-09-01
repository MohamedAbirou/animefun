import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client with service role for administrative operations
export const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Signed URL helper for storage
export const getSignedUrl = async (bucket: string, path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60) // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }
    
    return data.signedUrl
  } catch (err) {
    console.error('Failed to generate signed URL:', err)
    return null
  }
}

// Track download/interaction
export const trackInteraction = async (
  type: 'wallpaper_download' | 'quiz_completion' | 'game_download', 
  itemId: string,
  metadata?: Record<string, any>
) => {
  try {
    const { error } = await supabase.from('stats').insert({
      interaction_type: type,
      item_id: itemId,
      metadata
    })
    
    if (error) {
      console.error('Error tracking interaction:', error)
    }
  } catch (err) {
    console.error('Failed to track interaction:', err)
  }
}