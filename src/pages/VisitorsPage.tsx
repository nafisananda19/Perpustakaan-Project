import React, { useEffect, useState } from 'react';
import { Trash2, LogOut, UserCheck, Clock, Users, Download } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Visit } from '../types';
import { format } from 'date-fns';
import { exportToExcel, formatDataForExport } from '../utils/exportUtils';

export const VisitorsPage: React.FC = () => {
  const [dailyVisits, setDailyVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [todayStats, setTodayStats] = useState({ checkins: 0, checkouts: 0, active: 0 });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredVisits.length / pageSize);
  const currentVisits = filteredVisits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchDailyVisits();
    fetchTodayStats();
  }, []);

  useEffect(() => {
    const filtered = dailyVisits.filter(visit =>
      visit.visitor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVisits(filtered);
    setCurrentPage(1);
  }, [dailyVisits, searchTerm]);

  const fetchDailyVisits = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          visitor:visitors(*),
          member:members(*)
        `)
        .eq('visit_date', today)
        .order('checkin_time', { ascending: false });

      if (error) throw error;
      setDailyVisits(data || []);
    } catch (error) {
      console.error('Kesalahan mengambil data kunjungan harian:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total check-ins today
      const { count: checkins } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today);

      // Total check-outs today
      const { count: checkouts } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today)
        .not('checkout_time', 'is', null);

      // Active visitors (checked in but not checked out)
      const { count: active } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today)
        .is('checkout_time', null);

      setTodayStats({
        checkins: checkins || 0,
        checkouts: checkouts || 0,
        active: active || 0,
      });
    } catch (error) {
      console.error('Kesalahan mengambil statistik hari ini:', error);
    }
  };

  const handleDeleteVisit = async (visit: Visit) => {
    if (!confirm('Apakah anda yakin menghapus catatan kunjungan ini?')) return;

    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', visit.id);

      if (error) throw error;

      setDailyVisits(dailyVisits.filter(v => v.id !== visit.id));
      await fetchTodayStats();
    } catch (error) {
      console.error('Kesalahan menghapus kunjungan:', error);
      alert('Gagal menghapus catatan kunjungan');
    }
  };

  const handleCheckOut = async (visit: Visit) => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('visits')
        .update({
          checkout_time: now.toTimeString().split(' ')[0]
        })
        .eq('id', visit.id)
        .select(`
          *,
          visitor:visitors(*),
          member:members(*)
        `)
        .single();

      if (error) throw error;

      setDailyVisits(dailyVisits.map(v => v.id === visit.id ? data : v));
      await fetchTodayStats();

      const visitorName = visit.visitor?.name || visit.member?.name || 'Pengunjung';
      alert(`${visitorName} berhasil check-out!`);
    } catch (error) {
      console.error('Kesalahan check-out:', error);
      alert('Gagal melakukan check-out');
    }
  };

  const handleExportToExcel = () => {
    const exportData = formatDataForExport.visitors(filteredVisits);
    const success = exportToExcel(exportData, 'daily-visits-report', 'Daily Visits');

    if (success) {
      alert('Data kunjungan harian berhasil diekspor!');
    } else {
      alert('Data kunjungan harian gagal diekspor. Coba lagi.');
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'membaca': return 'Membaca';
      case 'meminjam': return 'Meminjam';
      case 'membaca_dan_meminjam': return 'Membaca & Meminjam';
      case 'lainnya': return 'Lainnya';
      default: return purpose;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'anak-anak': return 'Anak-anak';
      case 'remaja': return 'Remaja';
      case 'dewasa': return 'Dewasa';
      case 'pelajar': return 'Pelajar';
      case 'umum': return 'Umum';
      default: return category;
    }
  };

  const columns = [
    {
      header: 'Nama Pengunjung',
      accessorKey: 'visitor' as keyof Visit,
      cell: (value: any, row: Visit) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">
          {row.visitor?.name || row.member?.name || 'Unknown'}
        </div>
      ),
    },
    {
      header: 'Kategori',
      accessorKey: 'visitor' as keyof Visit,
      cell: (value: any, row: Visit) => {
        const category = row.visitor?.category || row.member?.category || '';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${category === 'anak-anak' ? 'bg-blue-100 text-blue-800' :
              category === 'remaja' ? 'bg-green-100 text-green-800' :
                category === 'pelajar' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
            }`}>
            {getCategoryLabel(category)}
          </span>
        );
      },
    },
    {
      header: 'Tujuan Kunjungan',
      accessorKey: 'purpose' as keyof Visit,
      cell: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
          {getPurposeLabel(value)}
        </span>
      ),
    },
    {
      header: 'Waktu Check-in',
      accessorKey: 'checkin_time' as keyof Visit,
      cell: (value: string) => (
        <div className="text-xs sm:text-sm whitespace-nowrap font-mono">
          {value || '-'}
        </div>
      ),
    },
    {
      header: 'Waktu Check-out',
      accessorKey: 'checkout_time' as keyof Visit,
      cell: (value: string) => (
        <div className={`text-xs sm:text-sm whitespace-nowrap font-mono ${!value ? 'text-orange-600 font-medium' : ''}`}>
          {value || 'Belum Check-out'}
        </div>
      ),
    },
    {
      header: 'Aksi',
      accessorKey: 'id' as keyof Visit,
      cell: (value: string, row: Visit) => (
        <div className="flex space-x-1 sm:space-x-2">
          {!row.checkout_time && (
            <button
              onClick={() => handleCheckOut(row)}
              className="text-orange-600 hover:text-orange-800 p-1"
              title="Check Out"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteVisit(row)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Kunjungan Harian</h1>
          <p className="text-gray-600">Daftar Kunjungan Hari Ini - {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportToExcel}
            size="sm"
            className="w-full sm:w-auto"
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Check-in Hari Ini</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{todayStats.checkins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Sedang Berkunjung</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{todayStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Check-out Hari Ini</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{todayStats.checkouts}</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={currentVisits}
        columns={columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        loading={loading}
      />
    </div>
  );
};