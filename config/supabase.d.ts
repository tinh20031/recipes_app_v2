declare module '@/config/supabase' {
  export const supabase: {
    from: (table: string) => any;
  };
} 