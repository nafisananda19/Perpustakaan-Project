import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 lg:hidden">
            Rumah Ilmu Lebah Dhuawar
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {user?.email}
            </span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};