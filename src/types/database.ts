export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          clerk_user_id: string
          username: string | null
          avatar_url: string | null
          storage_used: number
          plan_type: 'free' | 'pro' | 'enterprise'
          created_at: string
        }
        Insert: {
          clerk_user_id: string
          username?: string | null
          avatar_url?: string | null
          storage_used?: number
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
        }
        Update: {
          clerk_user_id?: string
          username?: string | null
          avatar_url?: string | null
          storage_used?: number
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          original_text: string
          edited_text: string | null
          audio_url: string | null
          audio_duration: number | null
          language: string
          format_type: 'plain' | 'markdown' | 'meeting' | 'subtitle'
          metadata: Record<string, any>
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          original_text: string
          edited_text?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          language?: string
          format_type?: 'plain' | 'markdown' | 'meeting' | 'subtitle'
          metadata?: Record<string, any>
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          original_text?: string
          edited_text?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          language?: string
          format_type?: 'plain' | 'markdown' | 'meeting' | 'subtitle'
          metadata?: Record<string, any>
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transcription_embeddings: {
        Row: {
          id: string
          transcription_id: string
          chunk_text: string
          embedding: number[]
          chunk_index: number
          created_at: string
        }
        Insert: {
          id?: string
          transcription_id: string
          chunk_text: string
          embedding: number[]
          chunk_index: number
          created_at?: string
        }
        Update: {
          id?: string
          transcription_id?: string
          chunk_text?: string
          embedding?: number[]
          chunk_index?: number
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          folder_id: string
          messages: Record<string, any>[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id: string
          messages?: Record<string, any>[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string
          messages?: Record<string, any>[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_similar_transcriptions: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          transcription_id: string
          chunk_text: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}