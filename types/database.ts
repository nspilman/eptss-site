export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      mailing_list: {
        Row: {
          additional_comments: string | null;
          created_at: string | null;
          email: string;
          id: number;
          name: string;
        };
        Insert: {
          additional_comments?: string | null;
          created_at?: string | null;
          email: string;
          id?: number;
          name: string;
        };
        Update: {
          additional_comments?: string | null;
          created_at?: string | null;
          email?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      mailing_list_unsubscription: {
        Row: {
          created_at: string | null;
          email: string;
          id: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      round_metadata: {
        Row: {
          covering_begins: string | null;
          covers_due: string | null;
          created_at: string | null;
          id: number;
          listening_party: string | null;
          playlist_url: string | null;
          round_type_override:
            | Database["public"]["Enums"]["round_type_override"]
            | null;
          signup_opens: string | null;
          song_id: number | null;
          voting_opens: string | null;
        };
        Insert: {
          covering_begins?: string | null;
          covers_due?: string | null;
          created_at?: string | null;
          id?: number;
          listening_party?: string | null;
          playlist_url?: string | null;
          round_type_override?:
            | Database["public"]["Enums"]["round_type_override"]
            | null;
          signup_opens?: string | null;
          song_id?: number | null;
          voting_opens?: string | null;
        };
        Update: {
          covering_begins?: string | null;
          covers_due?: string | null;
          created_at?: string | null;
          id?: number;
          listening_party?: string | null;
          playlist_url?: string | null;
          round_type_override?:
            | Database["public"]["Enums"]["round_type_override"]
            | null;
          signup_opens?: string | null;
          song_id?: number | null;
          voting_opens?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "round_metadata_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "signups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "vote_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_metadata_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "votes_diff_with_average";
            referencedColumns: ["id"];
          }
        ];
      };
      round_voting_candidate_overrides: {
        Row: {
          created_at: string;
          id: number;
          original_round_id: number | null;
          round_id: number | null;
          song_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          original_round_id?: number | null;
          round_id?: number | null;
          song_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          original_round_id?: number | null;
          round_id?: number | null;
          song_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "round_voting_candidate_overrides_original_round_id_fkey";
            columns: ["original_round_id"];
            isOneToOne: false;
            referencedRelation: "round_metadata";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "round_metadata";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "signups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "vote_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_voting_candidate_overrides_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "votes_diff_with_average";
            referencedColumns: ["id"];
          }
        ];
      };
      sign_ups: {
        Row: {
          additional_comments: string | null;
          created_at: string | null;
          id: number;
          round_id: number;
          song_id: number | null;
          user_id: string;
          youtube_link: string;
        };
        Insert: {
          additional_comments?: string | null;
          created_at?: string | null;
          id?: number;
          round_id: number;
          song_id?: number | null;
          user_id: string;
          youtube_link: string;
        };
        Update: {
          additional_comments?: string | null;
          created_at?: string | null;
          id?: number;
          round_id?: number;
          song_id?: number | null;
          user_id?: string;
          youtube_link?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sign_ups_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "signups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "vote_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sign_ups_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "votes_diff_with_average";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sign_ups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userid"];
          }
        ];
      };
      song_selection_votes: {
        Row: {
          created_at: string;
          id: number;
          round_id: number;
          song_id: number;
          submitter_email: string | null;
          user_id: string;
          vote: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          round_id: number;
          song_id: number;
          submitter_email?: string | null;
          user_id: string;
          vote: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          round_id?: number;
          song_id?: number;
          submitter_email?: string | null;
          user_id?: string;
          vote?: number;
        };
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "signups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "vote_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "votes_diff_with_average";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userid"];
          }
        ];
      };
      songs: {
        Row: {
          artist: string;
          created_at: string | null;
          id: number;
          title: string;
        };
        Insert: {
          artist: string;
          created_at?: string | null;
          id?: number;
          title: string;
        };
        Update: {
          artist?: string;
          created_at?: string | null;
          id?: number;
          title?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          additional_comments: string | null;
          created_at: string | null;
          id: number;
          round_id: number;
          soundcloud_url: string;
          user_id: string;
        };
        Insert: {
          additional_comments?: string | null;
          created_at?: string | null;
          id?: number;
          round_id: number;
          soundcloud_url: string;
          user_id: string;
        };
        Update: {
          additional_comments?: string | null;
          created_at?: string | null;
          id?: number;
          round_id?: number;
          soundcloud_url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "round_metadata";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userid"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          userid: string;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          userid: string;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          userid?: string;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_userid_fkey";
            columns: ["userid"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      mailinglist: {
        Row: {
          email: string | null;
        };
        Relationships: [];
      };
      public_signups: {
        Row: {
          created_at: string | null;
          round_id: number | null;
          username: string | null;
        };
        Relationships: [];
      };
      public_submissions: {
        Row: {
          artist: string | null;
          created_at: string | null;
          round_id: number | null;
          soundcloud_url: string | null;
          title: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "round_metadata";
            referencedColumns: ["id"];
          }
        ];
      };
      signups: {
        Row: {
          artist: string | null;
          created_at: string | null;
          id: number | null;
          round_id: number | null;
          title: string | null;
          username: string | null;
          youtube_link: string | null;
        };
        Relationships: [];
      };
      submissions_view: {
        Row: {
          artist: string | null;
          email: string | null;
          round_id: number | null;
          soundcloud_url: string | null;
          title: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "round_metadata";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userid"];
          }
        ];
      };
      vote_breakdown_by_song: {
        Row: {
          artist: string | null;
          average: number | null;
          five_count: number | null;
          four_count: number | null;
          one_count: number | null;
          round_id: number | null;
          song_id: number | null;
          three_count: number | null;
          title: string | null;
          two_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "signups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "vote_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_selection_votes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "votes_diff_with_average";
            referencedColumns: ["id"];
          }
        ];
      };
      vote_results: {
        Row: {
          artist: string | null;
          average: number | null;
          id: number | null;
          round_id: number | null;
          title: string | null;
        };
        Relationships: [];
      };
      votes_diff_with_average: {
        Row: {
          artist: string | null;
          average: number | null;
          email: string | null;
          id: number | null;
          round_id: number | null;
          title: string | null;
          user_id: string | null;
          vote: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "song_selection_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userid"];
          }
        ];
      };
    };
    Functions: {
      create_username: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_current_round: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_outstanding_voters: {
        Args: Record<PropertyKey, never>;
        Returns: {
          email: string;
        }[];
      };
      signup: {
        Args: {
          song_title: string;
          artist_name: string;
          additional_comments: string;
          round_id: number;
          user_id: string;
          youtube_link: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      round_type_override: "runner_up";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: unknown;
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;
