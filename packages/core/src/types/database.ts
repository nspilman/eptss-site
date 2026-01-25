export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      mailing_list: {
        Row: {
          additional_comments: string | null
          created_at: string | null
          email: string
          id: number
          name: string
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string | null
          email: string
          id?: number
          name: string
        }
        Update: {
          additional_comments?: string | null
          created_at?: string | null
          email?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      mailing_list_unsubscription: {
        Row: {
          created_at: string | null
          email: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      round_metadata: {
        Row: {
          covering_begins: string | null
          covers_due: string | null
          created_at: string | null
          id: number
          listening_party: string | null
          playlist_url: string | null
          round_type_override:
            | Database["public"]["Enums"]["round_type_override"]
            | null
          signup_opens: string | null
          song_id: number | null
          voting_opens: string | null
        }
        Insert: {
          covering_begins?: string | null
          covers_due?: string | null
          created_at?: string | null
          id?: number
          listening_party?: string | null
          playlist_url?: string | null
          round_type_override?:
            | Database["public"]["Enums"]["round_type_override"]
            | null
          signup_opens?: string | null
          song_id?: number | null
          voting_opens?: string | null
        }
        Update: {
          covering_begins?: string | null
          covers_due?: string | null
          created_at?: string | null
          id?: number
          listening_party?: string | null
          playlist_url?: string | null
          round_type_override?:
            | Database["public"]["Enums"]["round_type_override"]
            | null
          signup_opens?: string | null
          song_id?: number | null
          voting_opens?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_metadata_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "signups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "vote_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "votes_diff_with_average"
            referencedColumns: ["id"]
          },
        ]
      }
      round_voting_candidate_overrides: {
        Row: {
          created_at: string
          id: number
          original_round_id: number | null
          round_id: number | null
          song_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          original_round_id?: number | null
          round_id?: number | null
          song_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          original_round_id?: number | null
          round_id?: number | null
          song_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "round_voting_candidate_overrides_original_round_id_fkey"
            columns: ["original_round_id"]
            isOneToOne: false
            referencedRelation: "round_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "signups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "vote_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "votes_diff_with_average"
            referencedColumns: ["id"]
          },
        ]
      }
      sign_ups: {
        Row: {
          additional_comments: string | null
          created_at: string | null
          id: number
          round_id: number
          song_id: number | null
          user_id: string
          youtube_link: string
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string | null
          id?: number
          round_id: number
          song_id?: number | null
          user_id: string
          youtube_link: string
        }
        Update: {
          additional_comments?: string | null
          created_at?: string | null
          id?: number
          round_id?: number
          song_id?: number | null
          user_id?: string
          youtube_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "sign_ups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "signups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "vote_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "votes_diff_with_average"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_ups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      song_selection_votes: {
        Row: {
          created_at: string
          id: number
          round_id: number
          song_id: number
          submitter_email: string | null
          user_id: string
          vote: number
        }
        Insert: {
          created_at?: string
          id?: number
          round_id: number
          song_id: number
          submitter_email?: string | null
          user_id: string
          vote: number
        }
        Update: {
          created_at?: string
          id?: number
          round_id?: number
          song_id?: number
          submitter_email?: string | null
          user_id?: string
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "signups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "vote_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "votes_diff_with_average"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string
          created_at: string | null
          id: number
          title: string
        }
        Insert: {
          artist: string
          created_at?: string | null
          id?: number
          title: string
        }
        Update: {
          artist?: string
          created_at?: string | null
          id?: number
          title?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          additional_comments: string | null
          created_at: string | null
          id: number
          round_id: number
          soundcloud_url: string
          user_id: string
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string | null
          id?: number
          round_id: number
          soundcloud_url: string
          user_id: string
        }
        Update: {
          additional_comments?: string | null
          created_at?: string | null
          id?: number
          round_id?: number
          soundcloud_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      user_roles: {
        Row: {
          admin_level: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          admin_level: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          admin_level?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      user_share_permissions: {
        Row: {
          can_share_bsky: boolean
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          can_share_bsky: boolean
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          can_share_bsky?: boolean
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_share_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      users: {
        Row: {
          admin_level: number | null
          created_at: string | null
          email: string
          userid: string
          username: string | null
        }
        Insert: {
          admin_level?: number | null
          created_at?: string | null
          email: string
          userid: string
          username?: string | null
        }
        Update: {
          admin_level?: number | null
          created_at?: string | null
          email?: string
          userid?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mailinglist: {
        Row: {
          email: string | null
        }
        Relationships: []
      }
      public_signups: {
        Row: {
          created_at: string | null
          round_id: number | null
          username: string | null
        }
        Relationships: []
      }
      public_submissions: {
        Row: {
          artist: string | null
          created_at: string | null
          round_id: number | null
          soundcloud_url: string | null
          title: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      signups: {
        Row: {
          artist: string | null
          created_at: string | null
          id: number | null
          round_id: number | null
          title: string | null
          username: string | null
          youtube_link: string | null
        }
        Relationships: []
      }
      submissions_view: {
        Row: {
          artist: string | null
          email: string | null
          round_id: number | null
          soundcloud_url: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      vote_breakdown_by_song: {
        Row: {
          artist: string | null
          average: number | null
          five_count: number | null
          four_count: number | null
          one_count: number | null
          round_id: number | null
          song_id: number | null
          three_count: number | null
          title: string | null
          two_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "signups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "vote_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "votes_diff_with_average"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_results: {
        Row: {
          artist: string | null
          average: number | null
          id: number | null
          round_id: number | null
          title: string | null
          votes_count: number | null
        }
        Relationships: []
      }
      votes_diff_with_average: {
        Row: {
          artist: string | null
          average: number | null
          email: string | null
          id: number | null
          round_id: number | null
          title: string | null
          user_id: string | null
          vote: number | null
        }
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
    }
    Functions: {
      create_username: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_round: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_outstanding_voters: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
        }[]
      }
      get_user_submissions_by_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          round_id: number
          soundcloud_url: string
          created_at: string
          additional_comments: string
        }[]
      }
      signup: {
        Args: {
          song_title: string
          artist_name: string
          additional_comments: string
          round_id: number
          user_id: string
          youtube_link: string
        }
        Returns: undefined
      }
    }
    Enums: {
      round_type_override: "runner_up"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never