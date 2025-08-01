import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Visitor } from '../../types';
import { format } from 'date-fns';

const visitorSchema = z.object({
  name: z.string().min(1, 'Harap masukkan nama'),
  address: z.string().min(1, 'Harap masukkan alamat'),
  category: z.enum(['anak-anak', 'remaja', 'dewasa'], { required_error: 'Harap pilih kategori' }),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

interface VisitorFormProps {
  visitor?: Visitor | null;
  onSave: (visitor: Visitor) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

export const VisitorForm: React.FC<VisitorFormProps> = ({ visitor, onSave, onCancel, mode }) => {
  const [loading, setLoading] = useState(false);
  const isViewMode = mode === 'view';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues: visitor ? {
      name: visitor.name,
      address: visitor.address,
      category: visitor.category,
    } : {
      name: '',
      address: '',
      category: 'dewasa' as const,
    },
  });

  const onSubmit = async (data: VisitorFormData) => {
    if (isViewMode) return;

    try {
      setLoading(true);

      if (mode === 'create') {
        const { data: newVisitor, error } = await supabase
          .from('visitors')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        onSave(newVisitor);
      } else {
        const { data: updatedVisitor, error } = await supabase
          .from('visitors')
          .update(data)
          .eq('id', visitor!.id)
          .select()
          .single();

        if (error) throw error;
        onSave(updatedVisitor);
      }
    } catch (error) {
      console.error('Error saving visitor:', error);
      alert('Failed to save visitor');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'anak-anak', label: 'Anak-anak' },
    { value: 'remaja', label: 'Remaja' },
    { value: 'dewasa', label: 'Dewasa' },
  ];

  const purposes = [
    { value: 'membaca', label: 'Membaca' },
    { value: 'meminjam', label: 'Meminjam' },
    { value: 'membaca_dan_meminjam', label: 'Membaca & Meminjam' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama *
          </label>
          <input
            type="text"
            {...register('name')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            {...register('address')}
            disabled={isViewMode}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          {isViewMode ? 'Close' : 'Batal'}
        </Button>
        {!isViewMode && (
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Tambah Pengunjung' : 'Simpan Perubahan'}
          </Button>
        )}
      </div>
    </form>
  );
};