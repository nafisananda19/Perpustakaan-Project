import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { BookForm } from '../components/forms/BookForm';
import { exportToExcel, formatDataForExport } from '../utils/exportUtils';

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const pageSize = 10;
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Kesalahan mengambil data buku', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!confirm('Apakah anda yakin untuk menghapus buku?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', book.id);

      if (error) throw error;

      setBooks(books.filter(b => b.id !== book.id));
    } catch (error) {
      console.error('Gagal menghapus buku:', error);
      alert('Failed to delete book');
    }
  };

  const handleBookSaved = (book: Book) => {
    if (modalMode === 'create') {
      setBooks([book, ...books]);
    } else {
      setBooks(books.map(b => b.id === book.id ? book : b));
    }
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleExportToExcel = () => {
    const exportData = formatDataForExport.books(filteredBooks);
    const success = exportToExcel(exportData, 'books-report', 'Books');

    if (success) {
      alert('Data buku berhasil diekspor!');
    } else {
      alert('Data buku gagal diekspor. Coba lagi.');
    }
  };
  const columns = [
    {
      header: 'Kode Buku',
      accessorKey: 'kode_buku' as keyof Book,
      cell: (value: string) => (
        <div className="font-mono text-xs sm:text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
          {value || '-'}
        </div>
      ),
    },
    {
      header: 'Judul',
      accessorKey: 'title' as keyof Book,
      cell: (value: string) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">{value}</div>
      ),
    },
    {
      header: 'Penulis',
      accessorKey: 'author' as keyof Book,
      cell: (value: string) => (
        <div className="truncate max-w-xs">{value}</div>
      ),
    },
    {
      header: 'Kategori',
      accessorKey: 'category' as keyof Book,
      cell: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
          {value || 'Tidak ada kategori'}
        </span>
      ),
    },
    // {
    //   header: 'Tahun',
    //   accessorKey: 'added_date' as keyof Book,
    //   cell: (value: string) => (
    //     <div className="text-xs sm:text-sm">{format(new Date(value), 'yyyy')}</div>
    //   ),
    // },
    {
      header: 'Ketersediaan',
      accessorKey: 'available_copies' as keyof Book,
      cell: (value: number, row: Book) => (
        <span className={`font-medium text-xs sm:text-sm whitespace-nowrap ${value > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {value} / {row.total_copies}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessorKey: 'id' as keyof Book,
      cell: (value: string, row: Book) => (
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => {
              setSelectedBook(row);
              setModalMode('view');
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Details"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedBook(row);
              setModalMode('edit');
              setIsModalOpen(true);
            }}
            className="text-emerald-600 hover:text-emerald-800 p-1"
            title="Edit"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Buku</h1>
          <p className="text-gray-600">Kelola Koleksi Buku Disini</p>
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
              setSelectedBook(null);
              setModalMode('create');
              setIsModalOpen(true);
            }}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Buku
          </Button>
        </div>
      </div>

      <DataTable
        data={currentBooks}
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
          setSelectedBook(null);
        }}
        title={
          modalMode === 'create' ? 'Tambah Data Buku' :
            modalMode === 'edit' ? 'Edit Buku' : 'Detail Buku'
        }
        size="lg"
      >
        <BookForm
          book={selectedBook}
          onSave={handleBookSaved}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedBook(null);
          }}
          mode={modalMode}
        />
      </Modal>
    </div>
  );
};