export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          channel: string | null
          confidence: number | null
          created_at: string | null
          id: string
          segment: Json | null
          variant_a: string | null
          variant_b: string | null
          winner: string | null
        }
        Insert: {
          channel?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          segment?: Json | null
          variant_a?: string | null
          variant_b?: string | null
          winner?: string | null
        }
        Update: {
          channel?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          segment?: Json | null
          variant_a?: string | null
          variant_b?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      analyzed_posts: {
        Row: {
          analyzed_at: string | null
          candidates_mentioned: string[] | null
          embedding: string | null
          id: string
          intent: string | null
          is_bot_suspected: boolean | null
          issues: string[] | null
          key_insight: string | null
          language: string | null
          parties_mentioned: string[] | null
          relevance_score: number | null
          sentiment: string | null
          sentiment_score: number | null
          translation: string | null
        }
        Insert: {
          analyzed_at?: string | null
          candidates_mentioned?: string[] | null
          embedding?: string | null
          id: string
          intent?: string | null
          is_bot_suspected?: boolean | null
          issues?: string[] | null
          key_insight?: string | null
          language?: string | null
          parties_mentioned?: string[] | null
          relevance_score?: number | null
          sentiment?: string | null
          sentiment_score?: number | null
          translation?: string | null
        }
        Update: {
          analyzed_at?: string | null
          candidates_mentioned?: string[] | null
          embedding?: string | null
          id?: string
          intent?: string | null
          is_bot_suspected?: boolean | null
          issues?: string[] | null
          key_insight?: string | null
          language?: string | null
          parties_mentioned?: string[] | null
          relevance_score?: number | null
          sentiment?: string | null
          sentiment_score?: number | null
          translation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyzed_posts_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "raw_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          aliases: string[] | null
          bio: string | null
          constituency: string | null
          created_at: string | null
          id: string
          is_our_candidate: boolean | null
          mention_count_7d: number | null
          momentum: string | null
          name: string
          party: string | null
          photo_url: string | null
          sentiment_negative: number | null
          sentiment_neutral: number | null
          sentiment_positive: number | null
          share_of_voice: number | null
          threat_level: string | null
          twitter_handle: string | null
          facebook_url: string | null
          instagram_handle: string | null
          youtube_url: string | null
          tiktok_url: string | null
          updated_at: string | null
          win_prob: number | null
        }
        Insert: {
          aliases?: string[] | null
          bio?: string | null
          constituency?: string | null
          created_at?: string | null
          id?: string
          is_our_candidate?: boolean | null
          mention_count_7d?: number | null
          momentum?: string | null
          name: string
          party?: string | null
          photo_url?: string | null
          sentiment_negative?: number | null
          sentiment_neutral?: number | null
          sentiment_positive?: number | null
          share_of_voice?: number | null
          threat_level?: string | null
          twitter_handle?: string | null
          facebook_url?: string | null
          instagram_handle?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          win_prob?: number | null
        }
        Update: {
          aliases?: string[] | null
          bio?: string | null
          constituency?: string | null
          created_at?: string | null
          id?: string
          is_our_candidate?: boolean | null
          mention_count_7d?: number | null
          momentum?: string | null
          name?: string
          party?: string | null
          photo_url?: string | null
          sentiment_negative?: number | null
          sentiment_neutral?: number | null
          sentiment_positive?: number | null
          share_of_voice?: number | null
          threat_level?: string | null
          twitter_handle?: string | null
          facebook_url?: string | null
          instagram_handle?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          win_prob?: number | null
        }
        Relationships: []
      }
      candidates_history: {
        Row: {
          candidate_id: string | null
          id: string
          mention_count: number | null
          sentiment_positive: number | null
          snapshot_at: string | null
          win_prob: number | null
        }
        Insert: {
          candidate_id?: string | null
          id?: string
          mention_count?: number | null
          sentiment_positive?: number | null
          snapshot_at?: string | null
          win_prob?: number | null
        }
        Update: {
          candidate_id?: string | null
          id?: string
          mention_count?: number | null
          sentiment_positive?: number | null
          snapshot_at?: string | null
          win_prob?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_history_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          event_date: string | null
          id: string
          location: string | null
          notes: string | null
          title: string | null
          ward: string | null
        }
        Insert: {
          attendee_count?: number | null
          event_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title?: string | null
          ward?: string | null
        }
        Update: {
          attendee_count?: number | null
          event_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      field_reports: {
        Row: {
          agent_id: string | null
          candidate_id: string | null
          created_at: string | null
          id: string
          is_synced: boolean | null
          location: string | null
          mood_score: number | null
          notes: string | null
          photo_url: string | null
          priority: string | null
          report_type: string
          ward: string
        }
        Insert: {
          agent_id?: string | null
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          location?: string | null
          mood_score?: number | null
          notes?: string | null
          photo_url?: string | null
          priority?: string | null
          report_type: string
          ward: string
        }
        Update: {
          agent_id?: string | null
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          location?: string | null
          mood_score?: number | null
          notes?: string | null
          photo_url?: string | null
          priority?: string | null
          report_type?: string
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_reports_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      media_hits: {
        Row: {
          candidate_id: string | null
          headline: string | null
          id: string
          outlet: string | null
          published_at: string | null
          sentiment: string | null
          url: string | null
        }
        Insert: {
          candidate_id?: string | null
          headline?: string | null
          id?: string
          outlet?: string | null
          published_at?: string | null
          sentiment?: string | null
          url?: string | null
        }
        Update: {
          candidate_id?: string | null
          headline?: string | null
          id?: string
          outlet?: string | null
          published_at?: string | null
          sentiment?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_hits_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_sent: {
        Row: {
          campaign_id: string | null
          channel: string | null
          content: string | null
          delivered_count: number | null
          id: string
          open_rate: number | null
          response_rate: number | null
          segment: Json | null
          sent_at: string | null
          sent_count: number | null
        }
        Insert: {
          campaign_id?: string | null
          channel?: string | null
          content?: string | null
          delivered_count?: number | null
          id?: string
          open_rate?: number | null
          response_rate?: number | null
          segment?: Json | null
          sent_at?: string | null
          sent_count?: number | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string | null
          content?: string | null
          delivered_count?: number | null
          id?: string
          open_rate?: number | null
          response_rate?: number | null
          segment?: Json | null
          sent_at?: string | null
          sent_count?: number | null
        }
        Relationships: []
      }
      n8n_logs: {
        Row: {
          error: string | null
          id: string
          records_processed: number | null
          run_at: string | null
          status: string | null
          workflow_name: string | null
        }
        Insert: {
          error?: string | null
          id?: string
          records_processed?: number | null
          run_at?: string | null
          status?: string | null
          workflow_name?: string | null
        }
        Update: {
          error?: string | null
          id?: string
          records_processed?: number | null
          run_at?: string | null
          status?: string | null
          workflow_name?: string | null
        }
        Relationships: []
      }
      raw_posts: {
        Row: {
          author: string | null
          comments: number | null
          content: string
          external_id: string | null
          id: string
          likes: number | null
          platform: string
          posted_at: string | null
          scraped_at: string | null
          shares: number | null
          title: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          comments?: number | null
          content: string
          external_id?: string | null
          id?: string
          likes?: number | null
          platform: string
          posted_at?: string | null
          scraped_at?: string | null
          shares?: number | null
          title?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          comments?: number | null
          content?: string
          external_id?: string | null
          id?: string
          likes?: number | null
          platform?: string
          posted_at?: string | null
          scraped_at?: string | null
          shares?: number | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      voter_contacts: {
        Row: {
          age_group: string | null
          contact_count: number | null
          created_at: string | null
          gender: string | null
          id: string
          issues: string[] | null
          language_pref: string | null
          last_contact: string | null
          name: string | null
          notes: string | null
          phone: string | null
          source: string | null
          support_level: string | null
          ward: string | null
        }
        Insert: {
          age_group?: string | null
          contact_count?: number | null
          created_at?: string | null
          gender?: string | null
          id?: string
          issues?: string[] | null
          language_pref?: string | null
          last_contact?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          support_level?: string | null
          ward?: string | null
        }
        Update: {
          age_group?: string | null
          contact_count?: number | null
          created_at?: string | null
          gender?: string | null
          id?: string
          issues?: string[] | null
          language_pref?: string | null
          last_contact?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          support_level?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          role: string | null
          action: string
          module: string
          record_id: string | null
          details: Json | null
          ip_address: string | null
          result: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          role?: string | null
          action: string
          module: string
          record_id?: string | null
          details?: Json | null
          ip_address?: string | null
          result?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          role?: string | null
          action?: string
          module?: string
          record_id?: string | null
          details?: Json | null
          ip_address?: string | null
          result?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          title: string
          body: string | null
          type: string
          link: string | null
          read: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body?: string | null
          type?: string
          link?: string | null
          read?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string | null
          type?: string
          link?: string | null
          read?: boolean
          user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      political_parties: {
        Row: {
          id: string
          name: string
          short_name: string
          color: string | null
          hex_color: string | null
          logo_url: string | null
          description: string | null
          coalition: string | null
          founded_year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          color?: string | null
          hex_color?: string | null
          logo_url?: string | null
          description?: string | null
          coalition?: string | null
          founded_year?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          color?: string | null
          hex_color?: string | null
          logo_url?: string | null
          description?: string | null
          coalition?: string | null
          founded_year?: number | null
          created_at?: string
        }
        Relationships: []
      }
      political_seats: {
        Row: {
          id: string
          seat_type: string
          level: string
          county: string | null
          constituency: string | null
          ward: string | null
          candidate_name: string | null
          candidate_photo_url: string | null
          party_id: string | null
          vote_count: number
          vote_share: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seat_type: string
          level: string
          county?: string | null
          constituency?: string | null
          ward?: string | null
          candidate_name?: string | null
          candidate_photo_url?: string | null
          party_id?: string | null
          vote_count?: number
          vote_share?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seat_type?: string
          level?: string
          county?: string | null
          constituency?: string | null
          ward?: string | null
          candidate_name?: string | null
          candidate_photo_url?: string | null
          party_id?: string | null
          vote_count?: number
          vote_share?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "political_seats_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      election_events: {
        Row: {
          id: string
          event_name: string
          event_date: string
          description: string | null
          type: string
          is_primary: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_date: string
          description?: string | null
          type?: string
          is_primary?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_date?: string
          description?: string | null
          type?: string
          is_primary?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      candidate_intel: {
        Row: {
          id: string
          candidate_id: string
          party_affiliation: string | null
          campaign_platforms: string[] | null
          social_media_followers: Json | null
          local_endorsements: string[] | null
          popularity_notes: string | null
          party_support_breakdown: Json | null
          fame_rank: number | null
          exa_research: Json | null
          perplexity_analysis: string | null
          sources: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          party_affiliation?: string | null
          campaign_platforms?: string[] | null
          social_media_followers?: Json | null
          local_endorsements?: string[] | null
          popularity_notes?: string | null
          party_support_breakdown?: Json | null
          fame_rank?: number | null
          exa_research?: Json | null
          perplexity_analysis?: string | null
          sources?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          party_affiliation?: string | null
          campaign_platforms?: string[] | null
          social_media_followers?: Json | null
          local_endorsements?: string[] | null
          popularity_notes?: string | null
          party_support_breakdown?: Json | null
          fame_rank?: number | null
          exa_research?: Json | null
          perplexity_analysis?: string | null
          sources?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_intel_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      war_room_alerts: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          description: string | null
          id: string
          region: string | null
          severity: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          region?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          region?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "war_room_alerts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_records: {
        Row: {
          code: string | null
          created_at: string
          id: string
          meta: Json | null
          owner_label: string | null
          primary_date: string | null
          record_type: string
          sort_order: number
          status: string | null
          subtitle: string | null
          title: string
          workspace: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          owner_label?: string | null
          primary_date?: string | null
          record_type: string
          sort_order?: number
          status?: string | null
          subtitle?: string | null
          title: string
          workspace: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          owner_label?: string | null
          primary_date?: string | null
          record_type?: string
          sort_order?: number
          status?: string | null
          subtitle?: string | null
          title?: string
          workspace?: string
        }
        Relationships: []
      }
      workspace_series: {
        Row: {
          captured_at: string
          id: string
          label: string | null
          meta: Json | null
          period_label: string
          series_key: string
          slug: string
          sort_order: number
          value_num: number | null
          value_text: string | null
          workspace: string
        }
        Insert: {
          captured_at?: string
          id?: string
          label?: string | null
          meta?: Json | null
          period_label: string
          series_key: string
          slug: string
          sort_order?: number
          value_num?: number | null
          value_text?: string | null
          workspace: string
        }
        Update: {
          captured_at?: string
          id?: string
          label?: string | null
          meta?: Json | null
          period_label?: string
          series_key?: string
          slug?: string
          sort_order?: number
          value_num?: number | null
          value_text?: string | null
          workspace?: string
        }
        Relationships: []
      }
      workspace_snapshots: {
        Row: {
          captured_at: string
          created_at: string
          id: string
          payload: Json
          slug: string
          summary: string | null
          title: string | null
          workspace: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          id?: string
          payload?: Json
          slug: string
          summary?: string | null
          title?: string | null
          workspace: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          id?: string
          payload?: Json
          slug?: string
          summary?: string | null
          title?: string | null
          workspace?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_analyzed_posts: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          analyzed_at: string
          candidates_mentioned: string[]
          id: string
          key_insight: string
          sentiment: string
          similarity: number
          translation: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
