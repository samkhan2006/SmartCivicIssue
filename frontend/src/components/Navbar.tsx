import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User as UserIcon, RefreshCw, Menu, X, Landmark, ArrowRightLeft } from 'lucide-react';
import { resetDemoDatabase } from '../api';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  onRefreshData,
}) => {
  const { user, role, quickSwitchRole, logout } = useAuth();
  const [resetting, setResetting] = React.useState(false);

  const handleReset = async () => {
    if (confirm('Reset database back to initial Chhatrapati Sambhajinagar demo dataset (67 complaints)?')) {
      try {
        setResetting(true);
        await resetDemoDatabase();
        if (onRefreshData) onRefreshData();
        alert('Database reseeded with fresh demo complaints!');
      } catch (err) {
        alert('Failed to reset demo dataset.');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & City */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">SmartCivic</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  GIS Web
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
                Chhatrapati Sambhajinagar Municipal Corporation
              </p>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => quickSwitchRole('citizen')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                role === 'citizen'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => quickSwitchRole('admin')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset to 67 demo complaints"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
              role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {role === 'admin' ? 'AD' : 'RD'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {role === 'admin' ? 'Admin Portal' : 'Citizen Portal'}
              </p>
              <p className="text-[11px] text-slate-500 leading-none">
                {role === 'admin' ? 'admin@demo.com' : 'citizen@demo.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
