import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Users,
  UserCheck,
  Activity,
  BarChart3,
  Library,
  Home
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Daftar Buku', href: '/admin/books', icon: BookOpen },
  { name: 'Daftar Anggota', href: '/admin/members', icon: Users },
  { name: 'Daftar Peminjaman', href: '/admin/loans', icon: Activity },
  { name: 'Daftar Pengunjung', href: '/admin/visitors', icon: UserCheck },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
      <div className="flex h-16 shrink-0 items-center">
        <Library className="h-8 w-8 text-emerald-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">
          Rumah Ilmu
          <br />Lebah Dhuawar
        </span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200 ${isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${isActive ? 'text-emerald-700' : 'text-gray-400 group-hover:text-emerald-700'
                          }`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};