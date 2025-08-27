export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // add users table base on the new added migration
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          id: string
          email: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email?: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      anime_characters: {
        Row: {
          id: string
          anime_id: string
          name: string
          description: string
          image: string
          traits: string[]
          fun_facts: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          anime_id: string
          name: string
          description: string
          image?: string
          traits?: string[]
          fun_facts?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          anime_id?: string
          name?: string
          description?: string
          image?: string
          traits?: string[]
          fun_facts?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_characters_anime_id_fkey"
            columns: ["anime_id"]
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          }
        ]
      }
      anime_series: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          title: string
          description: string
          series_id: string | null
          apk_file: string
          screenshots: string[]
          tags: string[]
          download_count: number
          use_locker: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          series_id?: string | null
          apk_file: string
          screenshots: string[]
          tags?: string[]
          download_count?: number
          use_locker?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          series_id?: string | null
          apk_file?: string
          screenshots?: string[]
          tags?: string[]
          download_count?: number
          use_locker?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_series_id_fkey"
            columns: ["series_id"]
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question: string
          options: Json
          character_points: Json
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question: string
          options: Json
          character_points: Json
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question?: string
          options?: Json
          character_points?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_results: {
        Row: {
          id: string
          quiz_id: string
          character_id: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          character_id: string
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          character_id?: string
          session_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string
          anime_id: string | null
          min_questions: number
          max_questions: number
          questions: Json
          is_default: boolean
          completion_count: number
          use_locker: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          anime_id?: string | null
          min_questions?: number
          max_questions?: number
          questions: Json
          is_default?: boolean
          completion_count?: number
          use_locker?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          anime_id?: string | null
          min_questions?: number
          max_questions?: number
          questions?: Json
          is_default?: boolean
          completion_count?: number
          use_locker?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_anime_id_fkey"
            columns: ["anime_id"]
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          }
        ]
      }
      stats: {
        Row: {
          id: string
          interaction_type: string
          item_id: string
          ip_address: string | null
          session_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          interaction_type: string
          item_id: string
          ip_address?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          interaction_type?: string
          item_id?: string
          ip_address?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          currency: string
          interval: string
          features: string[]
          stripe_price_id: string
          trial_days: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          currency?: string
          interval: string
          features?: string[]
          stripe_price_id: string
          trial_days?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          currency?: string
          interval?: string
          features?: string[]
          stripe_price_id?: string
          trial_days?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_users_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_usage: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          feature_type: string
          usage_count: number | null
          limit_count: number | null
          reset_date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          feature_type: string
          usage_count?: number | null
          limit_count?: number | null
          reset_date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          feature_type?: string
          usage_count?: number | null
          limit_count?: number | null
          reset_date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wallpapers: {
        Row: {
          id: string
          series_id: string | null
          previews: Json
          download_links: Json
          download_count: number
          use_locker: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          series_id?: string | null
          previews: Json
          download_links: Json
          download_count?: number
          use_locker?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          series_id?: string | null
          previews?: Json
          download_links?: Json
          download_count?: number
          use_locker?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallpapers_series_id_fkey"
            columns: ["series_id"]
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          }
        ]
      }
      global_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
        }
        Update: {
          id?: string
          value: Json
          created_at?: string
        }
        Relationships: []
      }
      unlock_sessions: {
        Row: {
          session_id: string
          content_type: 'wallpaper' | 'quiz' | 'game'
          content_id: string
          unlocked: boolean
          created_at: string
          payout: number | null
          offer_id: string | null
          offer_name: string | null
        }
        Insert: {
          session_id?: string
          content_type: 'wallpaper' | 'quiz' | 'game'
          content_id: string
          unlocked?: boolean
          created_at?: string
          payout?: number | null
          offer_id?: string | null
          offer_name?: string | null
        }
        Update: {
          session_id?: string
          content_type?: 'wallpaper' | 'quiz' | 'game'
          content_id?: string
          unlocked?: boolean
          created_at?: string
          payout?: number | null
          offer_id?: string | null
          offer_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}