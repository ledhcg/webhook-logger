export interface Database {
  public: {
    Tables: {
      webhook_logs: {
        Row: {
          id: string;
          created_at: string;
          method: string;
          headers: Record<string, string>;
          body: Record<string, unknown>;
          source: string;
          path: string;
          status_code?: number;
          user_id?: string;
          token_id?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          method: string;
          headers: Record<string, string>;
          body: Record<string, unknown>;
          source: string;
          path: string;
          status_code?: number;
          user_id?: string;
          token_id?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          method?: string;
          headers?: Record<string, string>;
          body?: Record<string, unknown>;
          source?: string;
          path?: string;
          status_code?: number;
          user_id?: string;
          token_id?: string;
        };
      };
      user_webhooks: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          name?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
  };
}
