import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  PlusCircle,
  ClipboardList,
  MapPin,
  LayoutDashboard,
  Flame,
  Target,
  AlertTriangle,
  BarChart3,
  Info,
  LogOut,
  Map,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, quickSwitchRole } = useAuth();

  const citizenNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Issue', icon: PlusCircle, badge: 'New' },
    { id: 'my-complaints', label: 'My Complaints', icon: ClipboardList },
    { id: 'map', label: 'City Issue Map', icon: MapPin },
    { id: 'about', label: 'About & QGIS', icon: Info },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Complaint Map', icon: Map },
    { id: 'complaints', label: 'Complaint Management', icon: ClipboardList },
    { id: 'hotspots', label: 'Hotspot Analysis', icon: Flame, badge: 'GIS' },
    { id: 'proximity', label: 'Proximity Analysis', icon: Target, badge: 'GIS' },
    { id: 'repeated', label: 'Repeated Problem Areas', icon: AlertTriangle, badge: 'GIS' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'about', label: 'About & QGIS', icon: Info },
  ];

  const navItems = role === 'admin' ? adminNav : citizenNav;

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role === 'admin' ? 'Municipal Administration' : 'Citizen Services'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? role === 'admin'
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? role === 'admin'
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/80 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-slate-700">Study City</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">MH-20</span>
            </div>
            <p className="font-medium text-slate-800 text-xs">Chhatrapati Sambhajinagar</p>
            <p className="text-[11px] text-slate-500">Coordinates: 19.8762°N, 75.3433°E</p>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            College GIS Project Prototype v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
