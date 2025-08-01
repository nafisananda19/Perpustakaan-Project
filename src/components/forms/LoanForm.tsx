import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Loan, Member, Book } from '../../types';
import { format, addDays } from 'date-fns';

const loanSchema = z.object({
  member_id: z.string().min(1, 'Harap pilih anggota'),
  book_id: z.string().min(1, 'Harap pilih buku'),
  return_date: z.string().min(1, 'Harap pilih tanggal'),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanFormProps {
  loan?: Loan | null;
  onSave: (loan: Loan) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view' | 'return';
}

export const LoanForm: React.FC<LoanFormProps> = ({
  loan,
  onSave,
  onCancel,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const isViewMode = mode === 'view';
  const isReturnMode = mode === 'return';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: loan
      ? {
        member_id: loan.member_id,
        book_id: loan.book_id,
        return_date: loan.return_date.split('T')[0],
      }
      : {
        member_id: '',
        book_id: '',
        return_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      },
  });

  useEffect(() => {
    fetchMembers();
    fetchAvailableBooks();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gt('available_copies', 0)
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    if (isViewMode) return;

    try {
      setLoading(true);

      if (mode === 'create') {
        // Create loan and update book availability
        const { data: newLoan, error: loanError } = await supabase
          .from('loans')
          .insert([
            {
              ...data,
              return_date: new Date(data.return_date).toISOString(),
            },
          ])
          .select(
            `
            *,
            member:members(*),
            book:books(*)
          `
          )
          .single();

        if (loanError) throw loanError;

        // Update book available copies
        // 1. Ambil data buku
        const { data: book, error: fetchError } = await supabase
          .from('books')
          .select('available_copies')
          .eq('id', data.book_id)
          .single();

        if (fetchError) throw fetchError;

        // 2. Hitung stok baru (kurangi 1, tapi jangan sampai < 0)
        const newCount = Math.max(0, (book?.available_copies ?? 0) - 1);

        // 3. Update jumlah stok
        const { error: updateError } = await supabase
          .from('books')
          .update({ available_copies: newCount })
          .eq('id', data.book_id);

        if (updateError) throw updateError;

        onSave(newLoan);
      } else if (mode === 'return') {
        // Return book
        const { data: returnedLoan, error: returnError } = await supabase
          .from('loans')
          .update({
            status: 'dikembalikan',
            actual_return_date: new Date().toISOString(),
          })
          .eq('id', loan!.id)
          .select(
            `
            *,
            member:members(*),
            book:books(*)
          `
          )
          .single();

        if (returnError) throw returnError;

        // Update book available copies
        const { data: bookData, error: fetchError } = await supabase
          .from('books')
          .select('available_copies')
          .eq('id', loan!.book_id)
          .single();

        if (fetchError) throw fetchError;

        const updatedCopies = (bookData?.available_copies || 0) + 1;

        const { error: bookError } = await supabase
          .from('books')
          .update({ available_copies: updatedCopies })
          .eq('id', loan!.book_id);

        if (bookError) throw bookError;

        onSave(returnedLoan);
      }
    } catch (error) {
      console.error('Error processing loan:', error);
      alert('Failed to process loan');
    } finally {
      setLoading(false);
    }
  };

  if (isReturnMode) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800">
            Konfirmasi Pengembalian Buku
          </h4>
          <p className="text-yellow-700 mt-1">
            Apakah anda yakin untuk mengembalikan buku ini?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anggota
            </label>
            <input
              type="text"
              value={loan?.member?.name || 'Unknown'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buku
            </label>
            <input
              type="text"
              value={loan?.book?.title || 'Unknown'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pinjam
            </label>
            <input
              type="text"
              value={loan ? format(new Date(loan.loan_date), 'dd/MM/yyyy') : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pengembalian
            </label>
            <input
              type="text"
              value={
                loan ? format(new Date(loan.return_date), 'dd/MM/yyyy') : ''
              }
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>
            Konfirmasi Pengembalian
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anggota *
          </label>
          <select
            {...register('member_id')}
            disabled={isViewMode || mode === 'edit'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          >
            <option value="">Pilih Anggota</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.category === 'pelajar' ? 'Pelajar' : 'Umum'}
              </option>
            ))}
          </select>
          {errors.member_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.member_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buku *
          </label>
          <select
            {...register('book_id')}
            disabled={isViewMode || mode === 'edit'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          >
            <option value="">Pilih Buku</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author} (Available: {book.available_copies}
                )
              </option>
            ))}
          </select>
          {errors.book_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.book_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Pengembalian *
          </label>
          <input
            type="date"
            {...register('return_date')}
            disabled={isViewMode}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.return_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.return_date.message}
            </p>
          )}
        </div>

        {loan && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loan.status === 'Sedang Dipinjam'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
                }`}
            >
              {loan.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Sudah Dikembalikan'}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          {isViewMode ? 'Close' : 'Batal'}
        </Button>
        {!isViewMode && (
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Buat Pinjaman' : 'Simpan Perubahan'}
          </Button>
        )}
      </div>
    </form>
  );
};
