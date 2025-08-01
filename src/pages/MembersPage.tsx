import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Download } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Member } from '../types';
import { MemberForm } from '../components/forms/MemberForm';
import { format } from 'date-fns';
import { exportToExcel, formatDataForExport } from '../utils/exportUtils';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const pageSize = 10;
  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Kesalahan mengambil data anggota:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm('Apakah anda yakin menghapus anggota ini?')) return;

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== member.id));
    } catch (error) {
      console.error('Kesalahan menghapus anggota', error);
      alert('Gagal menghapus anggota');
    }
  };

  const handleMemberSaved = (member: Member) => {
    if (modalMode === 'create') {
      setMembers([member, ...members]);
    } else {
      setMembers(members.map(m => m.id === member.id ? member : m));
    }
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleExportToExcel = () => {
    const exportData = formatDataForExport.members(filteredMembers);
    const success = exportToExcel(exportData, 'members-report', 'Members');

    if (success) {
      alert('Data anggota berhasil diekspor!');
    } else {
      alert('Data anggota gagal diekspor. Coba lagi.');
    }
  };
  const columns = [
    {
      header: 'Nama',
      accessorKey: 'name' as keyof Member,
      cell: (value: string) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">{value}</div>
      ),
    },
    {
      header: 'Kategori',
      accessorKey: 'category' as keyof Member,
      cell: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${value === 'mahasiswa'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {value === 'mahasiswa' ? 'Mahasiswa' : 'Umum'}
          {value === 'pelajar' ? 'Pelajar' : 'Umum'}
        </span>
      ),
    },
    {
      header: 'Nomor HP',
      accessorKey: 'phone' as keyof Member,
      cell: (value: string) => (
        <div className="text-xs sm:text-sm truncate max-w-xs">{value}</div>
      ),
    },
    // {
    //   header: 'Jenis Kelamin',
    //   accessorKey: 'gender' as keyof Member,
    //   cell: (value: string) => (
    //     <div className="text-xs sm:text-sm">{value}</div>
    //   ),
    // },
    // {
    //   header: 'Tanggal Lahir',
    //   accessorKey: 'birth_date' as keyof Member,
    //   cell: (value: string) => (
    //     <div className="text-xs sm:text-sm whitespace-nowrap">
    //       {value && !isNaN(new Date(value).getTime()) ? format(new Date(value), 'dd/MM/yy') : '-'}
    //     </div>
    //   ),
    // },
    {
      header: 'Tanggal Bergabung',
      accessorKey: 'created_at' as keyof Member,
      cell: (value: string) => (
        <div className="text-xs sm:text-sm whitespace-nowrap">
          {value && !isNaN(new Date(value).getTime()) ? format(new Date(value), 'dd/MM/yy') : '-'}
        </div>
      ),
    },
    {
      header: 'Aksi',
      accessorKey: 'id' as keyof Member,
      cell: (value: string, row: Member) => (
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => {
              setSelectedMember(row);
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
              setSelectedMember(row);
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Anggota</h1>
          <p className="text-gray-600">Kelola Daftar Anggota Disini</p>
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
              setSelectedMember(null);
              setModalMode('create');
              setIsModalOpen(true);
            }}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Anggota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Anggota</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pelajar</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {members.filter(m => m.category === 'pelajar').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Umum</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {members.filter(m => m.category === 'umum').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={currentMembers}
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
          setSelectedMember(null);
        }}
        title={
          modalMode === 'create' ? 'Tambah Anggota' :
            modalMode === 'edit' ? 'Edit Anggota' : 'Informasi Anggota'
        }
        size="lg"
      >
        <MemberForm
          member={selectedMember}
          onSave={handleMemberSaved}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedMember(null);
          }}
          mode={modalMode}
        />
      </Modal>
    </div>
  );
};