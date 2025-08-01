import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Book } from '../../types';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  total_copies: z.number().min(1, 'Total copies must be at least 1'),
  available_copies: z.number().min(0, 'Available copies cannot be negative'),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  book?: Book | null;
  onSave: (book: Book) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

export const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel, mode }) => {
  const [loading, setLoading] = useState(false);
  const isViewMode = mode === 'view';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
      title: book.title,
      author: book.author,
      category: book.category || '',
      total_copies: book.total_copies,
      available_copies: book.available_copies,
    } : {
      title: '',
      author: '',
      category: '',
      total_copies: 1,
      available_copies: 1,
    },
  });

  const totalCopies = watch('total_copies');

  React.useEffect(() => {
    if (mode === 'create' && totalCopies) {
      setValue('available_copies', totalCopies);
    }
  }, [totalCopies, mode, setValue]);

  const onSubmit = async (data: BookFormData) => {
    if (isViewMode) return;

    try {
      setLoading(true);

      if (mode === 'create') {
        const { data: newBook, error } = await supabase
          .from('books')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        onSave(newBook);
      } else {
        const { data: updatedBook, error } = await supabase
          .from('books')
          .update(data)
          .eq('id', book!.id)
          .select()
          .single();

        if (error) throw error;
        onSave(updatedBook);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    'Pra-Sekolah', 'Materi Pelajaran', 'Pengetahuan Anak', 'Buku Cerita Anak',
    'Novel/Sastra', 'Motivasi', 'Umum', 'Agama', 'Keluarga & Kesehatan',
    'Keterampilan', 'Bahasa Inggris', 'Referensi'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul *
          </label>
          <input
            type="text"
            {...register('title')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penulis *
          </label>
          <input
            type="text"
            {...register('author')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori *
          </label>
          <select
            {...register('category')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          >
            <option value="">Pilih kategori</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Salinan *
          </label>
          <input
            type="number"
            {...register('total_copies', { valueAsNumber: true })}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.total_copies && (
            <p className="mt-1 text-sm text-red-600">{errors.total_copies.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salinan Tersedia *
          </label>
          <input
            type="number"
            {...register('available_copies', { valueAsNumber: true })}
            disabled={isViewMode || mode === 'create'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.available_copies && (
            <p className="mt-1 text-sm text-red-600">{errors.available_copies.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          {isViewMode ? 'Close' : 'Batal'}
        </Button>
        {!isViewMode && (
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Tambah Buku ' : 'Simpan Perubahan'}
          </Button>
        )}
      </div>
    </form>
  );
};