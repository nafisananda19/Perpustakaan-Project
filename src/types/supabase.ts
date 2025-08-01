export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          category: string;
          total_copies: number;
          available_copies: number;
          cover_url: string | null;
          added_date: string;
          kode_buku: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          category: string;
          total_copies: number;
          available_copies: number;
          cover_url?: string | null;
          added_date?: string;
          kode_buku?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          category?: string;
          total_copies?: number;
          available_copies?: number;
          cover_url?: string | null;
          added_date?: string;
          kode_buku?: string | null;
        };
      };
      members: {
        Row: {
          id: string;
          name: string;
          birth_place: string;
          birth_date: string;
          address: string;
          religion: string;
          gender: string;
          phone: string;
          category: 'pelajar' | 'umum';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_place: string;
          birth_date: string;
          address: string;
          religion: string;
          gender: string;
          phone: string;
          category: 'pelajar' | 'umum';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_place?: string;
          birth_date?: string;
          address?: string;
          religion?: string;
          gender?: string;
          phone?: string;
          category?: 'pelajar' | 'umum';
          created_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          member_id: string;
          book_id: string;
          loan_date: string;
          return_date: string;
          actual_return_date: string | null;
          status: 'dipinjam' | 'dikembalikan';
          fine: number;
        };
        Insert: {
          id?: string;
          member_id: string;
          book_id: string;
          loan_date?: string;
          return_date: string;
          actual_return_date?: string | null;
          status?: 'dipinjam' | 'dikembalikan';
          fine?: number;
        };
        Update: {
          id?: string;
          member_id?: string;
          book_id?: string;
          loan_date?: string;
          return_date?: string;
          actual_return_date?: string | null;
          status?: 'dipinjam' | 'dikembalikan';
          fine?: number;
        };
      };
      visitors: {
        Row: {
          id: string;
          name: string;
          address: string;
          category: 'anak-anak' | 'remaja' | 'dewasa';
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          category: 'anak-anak' | 'remaja' | 'dewasa';
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          category?: 'anak-anak' | 'remaja' | 'dewasa';
        };
      };
    };
    visits: {
      Row: {
        id: string;
        visit_date: string;
        checkin_time: string;
        checkout_time: string | null;
        member_id: string | null;
        visitor_id: string | null;
        purpose: 'membaca' | 'meminjam' | 'membaca_dan_meminjam' | 'lainnya';
      };
      Insert: {
        id?: string;
        visit_date?: string;
        checkin_time?: string;
        checkout_time?: string | null;
        member_id?: string | null;
        visitor_id?: string | null;
        purpose: 'membaca' | 'meminjam' | 'membaca_dan_meminjam' | 'lainnya';
      };
      Update: {
        id?: string;
        visit_date?: string;
        checkin_time?: string;
        checkout_time?: string | null;
        member_id?: string | null;
        visitor_id?: string | null;
        purpose?: 'membaca' | 'meminjam' | 'membaca_dan_meminjam' | 'lainnya';
      };
    };
  };
}