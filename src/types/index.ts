export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  total_copies: number;
  available_copies: number;
  cover_url?: string;
  added_date: string;
  kode_buku?: string;
};

export type Member = {
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

export type Loan = {
  id: string;
  member_id: string;
  book_id: string;
  loan_date: string;
  return_date: string;
  actual_return_date?: string;
  status: 'dipinjam' | 'dikembalikan';
  fine: number;
  member?: Member;
  book?: Book;
};

export type Visitor = {
  id: string;
  name: string;
  address: string;
  category: 'anak-anak' | 'remaja' | 'dewasa';
};

export type Visit = {
  id: string;
  visit_date: string;
  checkin_time: string;
  checkout_time?: string;
  member_id?: string;
  visitor_id?: string;
  purpose: 'membaca' | 'meminjam' | 'membaca_dan_meminjam' | 'lainnya';
  visitor?: Visitor;
  member?: Member;
};

export type DashboardStats = {
  totalBooks: number;
  totalMembers: number;
  todayVisitors: number;
  borrowedBooks: number;
  monthlyVisitors: Array<{ month: string; count: number }>;
  genreDistribution: Array<{ genre: string; count: number }>;
};