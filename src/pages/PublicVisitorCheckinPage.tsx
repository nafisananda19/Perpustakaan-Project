import React, { useState, useEffect } from 'react';
import { Search, UserPlus, LogIn, LogOut, Clock, Users, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const visitorSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  category: z.enum(['anak-anak', 'remaja', 'dewasa'], { required_error: 'Kategori wajib dipilih' }),
  purpose: z.enum(['membaca', 'meminjam', 'membaca_dan_meminjam', 'lainnya'], { required_error: 'Tujuan kunjungan wajib dipilih' }),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

interface ActiveVisit {
  id: string;
  visitor_id: string;
  visit_date: string;
  checkin_time: string;
  visitor: {
    id: string;
    name: string;
    address: string;
    category: string;
  };
  purpose: string;
}

export const PublicVisitorCheckinPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>('checkin');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVisits, setActiveVisits] = useState<ActiveVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ActiveVisit[]>([]);
  const [todayStats, setTodayStats] = useState({ checkins: 0, checkouts: 0, active: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: '',
      address: '',
      category: 'dewasa',
      purpose: 'membaca',
    },
  });

  useEffect(() => {
    fetchActiveVisits();
    fetchTodayStats();
  }, []);

  useEffect(() => {
    const filtered = activeVisits.filter(visit =>
      visit.visitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVisits(filtered);
  }, [activeVisits, searchTerm]);

  const fetchActiveVisits = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          visitor:visitors(*)
        `)
        .eq('visit_date', today)
        .is('checkout_time', null)
        .not('visitor_id', 'is', null)
        .order('checkin_time', { ascending: false });

      if (error) throw error;
      setActiveVisits(data || []);
    } catch (error) {
      console.error('Error fetching active visits:', error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total check-ins today
      const { count: checkins } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today)
        .not('visitor_id', 'is', null);

      // Total check-outs today
      const { count: checkouts } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today)
        .not('checkout_time', 'is', null)
        .not('visitor_id', 'is', null);

      // Active visitors (checked in but not checked out)
      const { count: active } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today)
        .is('checkout_time', null)
        .not('visitor_id', 'is', null);

      setTodayStats({
        checkins: checkins || 0,
        checkouts: checkouts || 0,
        active: active || 0,
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const handleCheckin = async (data: VisitorFormData) => {
    try {
      setLoading(true);

      // First, create or find the visitor
      let visitorId: string;

      // Check if visitor already exists
      const { data: existingVisitor } = await supabase
        .from('visitors')
        .select('id')
        .eq('name', data.name)
        .eq('address', data.address)
        .single();

      if (existingVisitor) {
        visitorId = existingVisitor.id;
      } else {
        // Create new visitor
        const { data: newVisitor, error: visitorError } = await supabase
          .from('visitors')
          .insert([{
            name: data.name,
            address: data.address,
            category: data.category,
          }])
          .select()
          .single();

        if (visitorError) throw visitorError;
        visitorId = newVisitor.id;
      }

      // Create visit record
      const now = new Date();
      const { error: visitError } = await supabase
        .from('visits')
        .insert([{
          visitor_id: visitorId,
          visit_date: now.toISOString().split('T')[0],
          checkin_time: now.toTimeString().split(' ')[0],
          purpose: data.purpose,
        }]);

      if (visitError) throw visitError;

      // Reset form and refresh data
      reset();
      await fetchActiveVisits();
      await fetchTodayStats();

      alert(`Selamat datang, ${data.name}! Check-in berhasil.`);
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Gagal melakukan check-in. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (visit: ActiveVisit) => {
    try {
      setLoading(true);

      const now = new Date();
      const { error } = await supabase
        .from('visits')
        .update({
          checkout_time: now.toTimeString().split(' ')[0]
        })
        .eq('id', visit.id);

      if (error) throw error;

      await fetchActiveVisits();
      await fetchTodayStats();

      alert(`Terima kasih, ${visit.visitor.name}! Check-out berhasil.`);
    } catch (error) {
      console.error('Error during check-out:', error);
      alert('Gagal melakukan check-out. Silakan coba lagi.');
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
    { value: 'meminjam', label: 'Meminjam Buku' },
    { value: 'membaca_dan_meminjam', label: 'Membaca & Meminjam' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rumah Ilmu Lebah Dhuawar Hijau
            </h1>
            <p className="text-gray-600">Sistem Check-in & Check-out Pengunjung</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <LogIn className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Check-in Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.checkins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Sedang Berkunjung</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <LogOut className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Check-out Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.checkouts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'checkin'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <UserPlus className="h-5 w-5 inline mr-2" />
              Check-in Pengunjung
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'checkout'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LogOut className="h-5 w-5 inline mr-2" />
              Check-out Pengunjung
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'checkin' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Daftar Pengunjung Baru
                </h3>
                <form onSubmit={handleSubmit(handleCheckin)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Usia *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tujuan Kunjungan *
                      </label>
                      <select
                        {...register('purpose')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {purposes.map(purpose => (
                          <option key={purpose.value} value={purpose.value}>
                            {purpose.label}
                          </option>
                        ))}
                      </select>
                      {errors.purpose && (
                        <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat *
                      </label>
                      <textarea
                        {...register('address')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Masukkan alamat lengkap"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={loading}
                      icon={UserPlus}
                      size="lg"
                      className="px-8"
                    >
                      Check-in Sekarang
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Check-out Pengunjung
                </h3>

                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama pengunjung..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredVisits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Tidak ada pengunjung yang ditemukan' : 'Belum ada pengunjung yang check-in hari ini'}
                    </div>
                  ) : (
                    filteredVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{visit.visitor.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>Kategori: {visit.visitor.category === 'anak-anak' ? 'Anak-anak' :
                              visit.visitor.category === 'remaja' ? 'Remaja' : 'Dewasa'}</p>
                            <p>Tujuan: {visit.purpose === 'membaca' ? 'Membaca' :
                              visit.purpose === 'meminjam' ? 'Meminjam Buku' :
                                visit.purpose === 'membaca_dan_meminjam' ? 'Membaca & Meminjam' : 'Lainnya'}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              Check-in: {visit.checkin_time}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCheckout(visit)}
                          loading={loading}
                          icon={LogOut}
                          variant="outline"
                        >
                          Check-out
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-8">
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};