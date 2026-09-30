import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Complaint, AnalyticsData } from './types';
import { fetchComplaints, fetchAnalytics } from './api';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ComplaintModal } from './components/ComplaintModal';

import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminMapPage } from './pages/AdminMapPage';
import { ComplaintManagementPage } from './pages/ComplaintManagementPage';
import { HotspotAnalysisPage } from './pages/HotspotAnalysisPage';
import { ProximityAnalysisPage } from './pages/ProximityAnalysisPage';
import { RepeatedProblemsPage } from './pages/RepeatedProblemsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';

function MainApp() {
  const { role, user } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>(role === 'admin' ? 'dashboard' : 'home');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Synchronize default tab on role switch
  useEffect(() => {
    if (role === 'admin') {
      if (['home', 'report', 'my-complaints'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    } else {
      if (['dashboard', 'complaints', 'hotspots', 'proximity', 'repeated', 'reports'].includes(currentTab)) {
        setCurrentTab('home');
      }
    }
  }, [role]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintList, stats] = await Promise.all([
        fetchComplaints(),
        fetchAnalytics(),
      ]);
      setComplaints(complaintList);
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to load civic data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdated = (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    if (selectedComplaint && selectedComplaint.id === updated.id) {
      setSelectedComplaint(updated);
    }
    // Refresh analytics stats
    fetchAnalytics().then(setAnalytics).catch(console.error);
  };

  const handleNewComplaint = (created: Complaint) => {
    setComplaints((prev) => [created, ...prev]);
    fetchAnalytics().then(setAnalytics).catch(console.error);
  };

  const renderContent = () => {
    if (currentTab === 'login') {
      return <LoginPage onLoginSuccess={() => setCurrentTab(role === 'admin' ? 'dashboard' : 'home')} />;
    }

    if (currentTab === 'about') {
      return <AboutPage />;
    }

    if (role === 'admin') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <AdminDashboardPage
              analytics={analytics}
              complaints={complaints}
              onNavigate={setCurrentTab}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'map':
          return (
            <AdminMapPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'complaints':
          return (
            <ComplaintManagementPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
              onStatusUpdated={handleStatusUpdated}
            />
          );
        case 'hotspots':
          return (
            <HotspotAnalysisPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'proximity':
          return (
            <ProximityAnalysisPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'repeated':
          return (
            <RepeatedProblemsPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'reports':
          return (
            <ReportsPage
              analytics={analytics}
              complaints={complaints}
            />
          );
        default:
          return (
            <AdminDashboardPage
              analytics={analytics}
              complaints={complaints}
              onNavigate={setCurrentTab}
              onSelectComplaint={setSelectedComplaint}
            />
          );
      }
    } else {
      // Citizen Views
      switch (currentTab) {
        case 'home':
          return (
            <HomePage
              analytics={analytics}
              complaints={complaints}
              onNavigate={setCurrentTab}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        case 'report':
          return (
            <ReportIssuePage
              onSuccess={handleNewComplaint}
              onTrackComplaint={(c) => {
                setSelectedComplaint(c);
                setCurrentTab('my-complaints');
              }}
            />
          );
        case 'my-complaints':
          return (
            <MyComplaintsPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
              onNavigateToReport={() => setCurrentTab('report')}
            />
          );
        case 'map':
          return (
            <AdminMapPage
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
            />
          );
        default:
          return (
            <HomePage
              analytics={analytics}
              complaints={complaints}
              onNavigate={setCurrentTab}
              onSelectComplaint={setSelectedComplaint}
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onRefreshData={loadData}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {loading && complaints.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">Connecting to Chhatrapati Sambhajinagar GIS database...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Global Complaint Modal */}
      <ComplaintModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        isAdmin={role === 'admin'}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
