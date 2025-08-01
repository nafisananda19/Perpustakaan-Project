import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Users,
  UserCheck,
  Activity,
  BarChart3,
  Home
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Daftar Buku', href: '/admin/books', icon: BookOpen },
  { name: 'Daftar Anggota', href: '/admin/members', icon: Users },
  { name: 'Daftar Peminjam', href: '/admin/loans', icon: Activity },
  { name: 'Daftar Pengunjung', href: '/admin/visitors', icon: UserCheck },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden shadow-lg">
      <div className="grid grid-cols-6 gap-0 px-1 py-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors duration-200 ${isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs mt-1 font-medium leading-tight text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};