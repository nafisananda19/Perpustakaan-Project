import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Member } from '../../types';

const memberSchema = z.object({
  name: z.string().min(1, 'Harap masukkan nama'),
  birth_place: z.string().min(1, 'Harap masukkan kota kelahiran'),
  birth_date: z.string().min(1, 'Harap masukkan tanggal lahir'),
  address: z.string().min(1, 'harap masukkan alamat'),
  religion: z.string().min(1, 'harap masukkan agama'),
  gender: z.string().min(1, 'harap masukkan jenis kelamin'),
  phone: z.string().min(1, 'harap masukkan nomor hp'),
  category: z.enum(['pelajar', 'umum'], { required_error: 'harap pilih kategori' }),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member | null;
  onSave: (member: Member) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

export const MemberForm: React.FC<MemberFormProps> = ({ member, onSave, onCancel, mode }) => {
  const [loading, setLoading] = useState(false);
  const isViewMode = mode === 'view';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member ? {
      name: member.name,
      birth_place: member.birth_place,
      birth_date: member.birth_date,
      address: member.address,
      religion: member.religion,
      gender: member.gender,
      phone: member.phone,
      category: member.category,
    } : {
      name: '',
      birth_place: '',
      birth_date: '',
      address: '',
      religion: '',
      gender: '',
      phone: '',
      category: 'pelajar' as const,
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    if (isViewMode) return;

    try {
      setLoading(true);

      if (mode === 'create') {
        const { data: newMember, error } = await supabase
          .from('members')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        onSave(newMember);
      } else {
        const { data: updatedMember, error } = await supabase
          .from('members')
          .update(data)
          .eq('id', member!.id)
          .select()
          .single();

        if (error) throw error;
        onSave(updatedMember);
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
  const genders = ['Laki-laki', 'Perempuan'];

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
            Kota Kelahiran *
          </label>
          <input
            type="text"
            {...register('birth_place')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.birth_place && (
            <p className="mt-1 text-sm text-red-600">{errors.birth_place.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Lahir *
          </label>
          <input
            type="date"
            {...register('birth_date')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.birth_date && (
            <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agama *
          </label>
          <select
            {...register('religion')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          >
            <option value="">Pilih Agama</option>
            {religions.map(religion => (
              <option key={religion} value={religion}>{religion}</option>
            ))}
          </select>
          {errors.religion && (
            <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin *
          </label>
          <select
            {...register('gender')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          >
            <option value="">Pilih jenis kelamin</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor HP *
          </label>
          <input
            type="tel"
            {...register('phone')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
            <option value="umum">Umum</option>
            <option value="pelajar">Pelajar</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat *
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
            {mode === 'create' ? 'Tambah Anggota' : 'Simpan Perubahan'}
          </Button>
        )}
      </div>
    </form>
  );
};