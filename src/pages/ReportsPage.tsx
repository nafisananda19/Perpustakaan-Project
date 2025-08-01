import React, { useEffect, useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Loan, Visit } from '../types';

const COLORS = ['#059669', '#2563eb', '#ea580c', '#7c3aed', '#dc2626', '#0891b2'];

interface ReportData {
  monthlyLoans: Array<{ month: string; count: number }>;
  genrePopularity: Array<{ genre: string; count: number }>;
  memberActivity: Array<{ category: string; count: number }>;
  visitorTrends: Array<{ month: string; count: number }>;
  overdueBooks: number;
  activeMembers: number;
  totalFines: number;
  popularBooks: Array<{ title: string; author: string; loans: number }>;
}

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    monthlyLoans: [],
    genrePopularity: [],
    memberActivity: [],
    visitorTrends: [],
    overdueBooks: 0,
    activeMembers: 0,
    totalFines: 0,
    popularBooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  // Visitor report states
  const [visitorReportData, setVisitorReportData] = useState<Visit[]>([]);
  const [selectedVisitorPeriod, setSelectedVisitorPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [visitorCurrentPage, setVisitorCurrentPage] = useState(1);
  const [filteredVisitorData, setFilteredVisitorData] = useState<Visit[]>([]);

  useEffect(() => {
    fetchReportData();
    fetchVisitorReport();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchVisitorReport();
  }, [selectedVisitorPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    const filtered = visitorReportData.filter(visit =>
      (visit.visitor?.name || visit.member?.name || '').toLowerCase().includes(visitorSearchTerm.toLowerCase()) ||
      visit.purpose.toLowerCase().includes(visitorSearchTerm.toLowerCase())
    );
    setFilteredVisitorData(filtered);
    setVisitorCurrentPage(1);
  }, [visitorReportData, visitorSearchTerm]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const monthsBack = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
      const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1));

      // Fetch loans data
      const { data: loansData } = await supabase
        .from('loans')
        .select(`
          *,
          book:books(title, author, category),
          member:members(category)
        `)
        .gte('loan_date', startDate.toISOString());

      // Fetch visitors data
      const { data: visitorsData } = await supabase
        .from('visitors')
        .select('visit_date')
        .gte('visit_date', format(startDate, 'yyyy-MM-dd'));

      // Fetch members data
      const { data: membersData } = await supabase
        .from('members')
        .select('category');

      // Process monthly loans
      const monthlyLoans = processMonthlyData(loansData || [], 'loan_date', monthsBack);

      // Process visitor trends
      const visitorTrends = processMonthlyVisitors(visitorsData || [], monthsBack);

      // Process genre popularity
      const genrePopularity = processGenrePopularity(loansData || []);

      // Process member activity
      const memberActivity = processMemberActivity(membersData || []);

      // Calculate overdue books
      const overdueBooks = (loansData || []).filter(loan =>
        loan.status === 'dipinjam' && new Date() > new Date(loan.return_date)
      ).length;

      // Calculate total fines
      const totalFines = (loansData || []).reduce((sum, loan) => sum + (loan.fine || 0), 0);

      // Get popular books
      const popularBooks = getPopularBooks(loansData || []);

      setReportData({
        monthlyLoans,
        genrePopularity,
        memberActivity,
        visitorTrends,
        overdueBooks,
        activeMembers: membersData?.length || 0,
        totalFines,
        popularBooks,
      });
    } catch (error) {
      console.error('Kesalahan mengambil data laporan', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorReport = async () => {
    try {
      setVisitorLoading(true);

      let startDate: Date;
      let endDate: Date = new Date();

      switch (selectedVisitorPeriod) {
        case 'today':
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
          break;
        case 'yesterday':
          startDate = startOfDay(subDays(new Date(), 1));
          endDate = endOfDay(subDays(new Date(), 1));
          break;
        case 'last7days':
          startDate = startOfDay(subDays(new Date(), 6));
          endDate = endOfDay(new Date());
          break;
        case 'custom':
          if (!customStartDate || !customEndDate) return;
          startDate = startOfDay(new Date(customStartDate));
          endDate = endOfDay(new Date(customEndDate));
          break;
        default:
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
      }

      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          visitor:visitors(*),
          member:members(*)
        `)
        .gte('visit_date', format(startDate, 'yyyy-MM-dd'))
        .lte('visit_date', format(endDate, 'yyyy-MM-dd'))
        .order('visit_date', { ascending: false })
        .order('checkin_time', { ascending: false });

      if (error) throw error;
      setVisitorReportData(data || []);
    } catch (error) {
      console.error('Kesalahan mengambil laporan pengunjung:', error);
    } finally {
      setVisitorLoading(false);
    }
  };

  const processMonthlyData = (data: any[], dateField: string, months: number) => {
    const monthCounts: { [key: string]: number } = {};

    data.forEach(item => {
      const month = format(new Date(item[dateField]), 'MMM yyyy');
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    // Generate all months in range
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const month = format(subMonths(new Date(), i), 'MMM yyyy');
      result.push({ month, count: monthCounts[month] || 0 });
    }

    return result;
  };

  const processMonthlyVisitors = (data: any[], months: number) => {
    const monthCounts: { [key: string]: number } = {};

    data.forEach(visitor => {
      const month = format(new Date(visitor.visit_date), 'MMM yyyy');
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const month = format(subMonths(new Date(), i), 'MMM yyyy');
      result.push({ month, count: monthCounts[month] || 0 });
    }

    return result;
  };

  const processGenrePopularity = (data: any[]) => {
    const genreCounts: { [key: string]: number } = {};

    data.forEach(loan => {
      if (loan.book?.category) {
        genreCounts[loan.book.category] = (genreCounts[loan.book.category] || 0) + 1;
      }
    });

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const processMemberActivity = (data: any[]) => {
    const categoryCounts: { [key: string]: number } = {};

    data.forEach(member => {
      const category = member.category === 'pelajar' ? 'Pelajar' : 'Umum';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }));
  };

  const getPopularBooks = (data: any[]) => {
    const bookCounts: { [key: string]: { title: string; author: string; loans: number } } = {};

    data.forEach(loan => {
      if (loan.book) {
        const key = loan.book.id;
        if (!bookCounts[key]) {
          bookCounts[key] = {
            title: loan.book.title,
            author: loan.book.author,
            loans: 0
          };
        }
        bookCounts[key].loans++;
      }
    });

    return Object.values(bookCounts)
      .sort((a, b) => b.loans - a.loans)
      .slice(0, 5);
  };

  const generatePDFReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFontSize(20);
    pdf.text('Laporan Perpustakaan', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 30, { align: 'center' });
    pdf.text(`Period: ${selectedPeriod}`, pageWidth / 2, 40, { align: 'center' });

    // Summary Statistics
    pdf.setFontSize(16);
    pdf.text('Analisa', 20, 60);

    pdf.setFontSize(12);
    let yPos = 75;
    pdf.text(`Anggota Aktif: ${reportData.activeMembers}`, 20, yPos);
    yPos += 10;
    pdf.text(`Keterlambatan: ${reportData.overdueBooks}`, 20, yPos);
    yPos += 10;
    pdf.text(`Total Denda: Rp ${reportData.totalFines.toLocaleString()}`, 20, yPos);
    yPos += 20;

    // Popular Books
    pdf.setFontSize(16);
    pdf.text('Judul Populer', 20, yPos);
    yPos += 15;

    pdf.setFontSize(12);
    reportData.popularBooks.forEach((book, index) => {
      pdf.text(`${index + 1}. ${book.title} by ${book.author} (${book.loans} loans)`, 25, yPos);
      yPos += 8;
    });

    // Capture charts
    const chartsElement = document.getElementById('charts-container');
    if (chartsElement) {
      const canvas = await html2canvas(chartsElement);
      const imgData = canvas.toDataURL('image/png');

      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Charts and Analytics', 20, 20);

      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
    }

    pdf.save(`library-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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

  const visitorPageSize = 10;
  const visitorTotalPages = Math.ceil(filteredVisitorData.length / visitorPageSize);
  const currentVisitorData = filteredVisitorData.slice(
    (visitorCurrentPage - 1) * visitorPageSize,
    visitorCurrentPage * visitorPageSize
  );

  const visitorColumns = [
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
      header: 'Tanggal Kunjungan',
      accessorKey: 'visit_date' as keyof Visit,
      cell: (value: string) => (
        <div className="text-xs sm:text-sm whitespace-nowrap">
          {format(new Date(value), 'dd/MM/yyyy')}
        </div>
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
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
          <p className="text-gray-600">Cek Laporan & Statistik Kegiatan Disini</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="3months">3 Bulan Terakhir</option>
            <option value="6months">6 Bulan Terakhir</option>
            <option value="12months">1 Tahun Terakhir</option>
          </select>
          <Button icon={Download} onClick={generatePDFReport}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Anggota Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.activeMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Keterlambatan</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.overdueBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Pinjaman</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.monthlyLoans.reduce((sum, month) => sum + month.count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Judul Terpopuler</h3>
        <div className="space-y-3">
          {reportData.popularBooks.map((book, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">{book.title}</p>
                <p className="text-sm text-gray-600">by {book.author}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
                {book.loans} terpinjam
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div id="charts-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Peminjam Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.monthlyLoans}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Genre Populer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.genrePopularity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ genre, percent }) => `${genre} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {reportData.genrePopularity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Pengunjung</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.visitorTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Anggota</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.memberActivity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {reportData.memberActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor Reports Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Laporan Data Pengunjung
            </h3>
            <p className="text-gray-600 text-sm">Filter dan lihat data kunjungan berdasarkan periode</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedVisitorPeriod}
              onChange={(e) => setSelectedVisitorPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="last7days">7 Hari Terakhir</option>
              <option value="custom">Rentang Kustom</option>
            </select>

            {selectedVisitorPeriod === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Tanggal Mulai"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Tanggal Akhir"
                />
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredVisitorData.length}</p>
                <p className="text-sm text-gray-600">Total Kunjungan</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredVisitorData.filter(v => v.checkout_time).length}
                </p>
                <p className="text-sm text-gray-600">Sudah Check-out</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredVisitorData.filter(v => !v.checkout_time).length}
                </p>
                <p className="text-sm text-gray-600">Belum Check-out</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          data={currentVisitorData}
          columns={visitorColumns}
          searchTerm={visitorSearchTerm}
          setSearchTerm={setVisitorSearchTerm}
          currentPage={visitorCurrentPage}
          setCurrentPage={setVisitorCurrentPage}
          pageSize={visitorPageSize}
          totalPages={visitorTotalPages}
          loading={visitorLoading}
        />
      </div>
    </div>
  );
};