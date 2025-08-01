import React, { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, Activity } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#059669', '#2563eb', '#ea580c', '#7c3aed', '#dc2626'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalMembers: 0,
    todayVisitors: 0,
    borrowedBooks: 0,
    monthlyVisitors: [],
    genreDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total books
      const { count: totalBooks } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      // Get total members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Get today's visitors
      const today = new Date().toISOString().split('T')[0];
      const { count: todayVisitors } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today);

      // Get borrowed books
      const { count: borrowedBooks } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'dipinjam');

      // Get monthly visitors (last 6 months)
      const { data: monthlyVisitorsData } = await supabase
        .from('visits')
        .select('visit_date')
        .gte('visit_date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Process monthly visitors data
      const monthlyVisitors = processMonthlyVisitors(monthlyVisitorsData || []);

      // Get genre distribution
      const { data: genreData } = await supabase
        .from('books')
        .select('category');

      const genreDistribution = processGenreDistribution(genreData || []);

      setStats({
        totalBooks: totalBooks || 0,
        totalMembers: totalMembers || 0,
        todayVisitors: todayVisitors || 0,
        borrowedBooks: borrowedBooks || 0,
        monthlyVisitors,
        genreDistribution,
      });
    } catch (error) {
      console.error('Kesalahan mengambil statistik dasbor:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyVisitors = (data: any[]) => {
    const monthCounts: { [key: string]: number } = {};

    data.forEach(visitor => {
      const month = new Date(visitor.visit_date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);
  };

  const processGenreDistribution = (data: any[]) => {
    const genreCounts: { [key: string]: number } = {};

    data.forEach(book => {
      if (book.category) {
        genreCounts[book.category] = (genreCounts[book.category] || 0) + 1;
      }
    });

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Rumah Ilmu Lebah Dhuawar Hijau</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Buku"
          value={stats.totalBooks}
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Anggota Aktif"
          value={stats.totalMembers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pengunjung Harian"
          value={stats.todayVisitors}
          icon={UserCheck}
          color="orange"
        />
        <StatCard
          title="Buku Terpinjam"
          value={stats.borrowedBooks}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengunjung Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyVisitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Judul Populer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.genreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ genre, percent }): string => `${genre} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.genreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};