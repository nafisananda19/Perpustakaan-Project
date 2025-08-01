import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw, Activity, Clock, CheckCircle, Download } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Loan } from '../types';
import { LoanForm } from '../components/forms/LoanForm';
import { format, isAfter, parseISO } from 'date-fns';
import { exportToExcel, formatDataForExport } from '../utils/exportUtils';

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'return'>('create');

  const pageSize = 10;
  const totalPages = Math.ceil(filteredLoans.length / pageSize);
  const currentLoans = filteredLoans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    const filtered = loans.filter(loan =>
      loan.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.book?.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLoans(filtered);
    setCurrentPage(1);
  }, [loans, searchTerm]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          member:members(*),
          book:books(*)
        `)
        .order('loan_date', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (loan: Loan) => {
    if (!confirm('Are you sure you want to delete this loan record?')) return;

    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loan.id);

      if (error) throw error;

      setLoans(loans.filter(l => l.id !== loan.id));
    } catch (error) {
      console.error('Error deleting loan:', error);
      alert('Failed to delete loan');
    }
  };

  const handleLoanSaved = (loan: Loan) => {
    if (modalMode === 'create') {
      setLoans([loan, ...loans]);
    } else {
      setLoans(loans.map(l => l.id === loan.id ? loan : l));
    }
    setIsModalOpen(false);
    setSelectedLoan(null);

    // Refresh the list to get updated data
    fetchLoans();
  };

  const handleExportToExcel = () => {
    const exportData = formatDataForExport.loans(filteredLoans);
    const success = exportToExcel(exportData, 'loans-report', 'Loans');

    if (success) {
      alert('Loans data exported successfully!');
    } else {
      alert('Failed to export data. Please try again.');
    }
  };
  const isOverdue = (loan: Loan) => {
    if (loan.status === 'dikembalikan') return false;
    return isAfter(new Date(), parseISO(loan.return_date));
  };

  const borrowedLoans = loans.filter(loan => loan.status === 'dipinjam');
  const returnedLoans = loans.filter(loan => loan.status === 'dikembalikan');
  const overdueLoans = loans.filter(loan => isOverdue(loan));

  const columns = [
    {
      header: 'Nama Peminjam',
      accessorKey: 'member' as keyof Loan,
      cell: (value: any) => (
        <div className="font-medium text-gray-900 min-w-0">
          <div className="truncate">{value?.name || 'Unknown Member'}</div>
        </div>
      ),
    },
    {
      header: 'Buku yang dipinjam',
      accessorKey: 'book' as keyof Loan,
      cell: (value: any) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">{value?.title || 'Unknown Book'}</div>
          <div className="text-xs sm:text-sm text-gray-500 truncate">{value?.author}</div>
        </div>
      ),
    },
    {
      header: 'Tanggal Peminjaman',
      accessorKey: 'loan_date' as keyof Loan,
      cell: (value: string) => (
        <div className="whitespace-nowrap text-xs sm:text-sm">
          {format(new Date(value), 'dd/MM/yy')}
        </div>
      ),
    },
    {
      header: 'Tenggat Waktu',
      accessorKey: 'return_date' as keyof Loan,
      cell: (value: string, row: Loan) => (
        <div className={`whitespace-nowrap text-xs sm:text-sm ${isOverdue(row) ? 'text-red-600 font-medium' : ''}`}>
          {format(new Date(value), 'dd/MM/yy')}
          {isOverdue(row) && <div className="text-xs text-red-600 font-bold">TERLAMBAT</div>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Loan,
      cell: (value: string, row: Loan) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${value === 'dipinjam'
          ? isOverdue(row)
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
          }`}>
          {value === 'dipinjam' ? 'Sedang Dipinjam' : 'Sudah Dikembalikan'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessorKey: 'id' as keyof Loan,
      cell: (value: string, row: Loan) => (
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => {
              setSelectedLoan(row);
              setModalMode('view');
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Tampilkan Detail"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          {row.status === 'dipinjam' && (
            <button
              onClick={() => {
                setSelectedLoan(row);
                setModalMode('return');
                setIsModalOpen(true);
              }}
              className="text-green-600 hover:text-green-800 p-1"
              title="Kembalikan Buku"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(row)}
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Peminjaman</h1>
          <p className="text-gray-600">Kelola Daftar Pinjam Disini</p>
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
          <Button
            icon={Plus}
            onClick={() => {
              setSelectedLoan(null);
              setModalMode('create');
              setIsModalOpen(true);
            }}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Data Pinjaman
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Pinjaman</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{loans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Terpinjam</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{borrowedLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pengembalian</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{returnedLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Keterlambatan</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{overdueLoans.length}</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={currentLoans}
        columns={columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoan(null);
        }}
        title={
          modalMode === 'create' ? 'Buat Peminjaman' :
            modalMode === 'edit' ? 'Edit Peminjaman' :
              modalMode === 'return' ? 'Pengembalian Buku' : 'Detail Peminjaman'
        }
        size="lg"
      >
        <LoanForm
          loan={selectedLoan}
          onSave={handleLoanSaved}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedLoan(null);
          }}
          mode={modalMode}
        />
      </Modal>
    </div>
  );
};