import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import { HospitalLayout } from './components/common/HospitalLayout';
import { Toast } from './components/common/Toast';
import { LoginPage } from './pages/LoginPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LiveQueuePage } from './pages/LiveQueuePage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicQueueBoard } from './components/public/PublicQueueBoard';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toastMessage, dismissToast } = useNotifications();

  // Navigation tab / view state
  const [currentView, setCurrentView] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentView(hash);
      } else {
        setCurrentView('dashboard');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  // Public TV Waiting Room display mode without sidebar/topbar
  if (currentView === 'public-board') {
    return (
      <>
        <PublicQueueBoard />
        {toastMessage && (
          <Toast
            title={toastMessage.title}
            message={toastMessage.message}
            onDismiss={dismissToast}
          />
        )}
      </>
    );
  }

  // Login page for unauthenticated visitors
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onSuccess={() => {
            // Hash listener will update view automatically
          }}
        />
        {toastMessage && (
          <Toast
            title={toastMessage.title}
            message={toastMessage.message}
            onDismiss={dismissToast}
          />
        )}
      </>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'PATIENT':
        return <PatientDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  const renderContent = () => {
    // Route to appropriate dedicated page based on current navigation view
    switch (currentView) {
      case 'dashboard':
      case 'doctor':
      case 'patient':
        return renderDashboard();

      case 'queue':
        return <LiveQueuePage />;

      case 'patients':
        return <PatientsPage />;

      case 'appointments':
        return <AppointmentsPage />;

      case 'records':
      case 'audit':
        return <MedicalRecordsPage />;

      case 'departments':
        return <DepartmentsPage />;

      case 'reports':
      case 'analytics':
        return <AdminDashboard />;

      case 'settings':
        return <SettingsPage />;

      case 'reception':
        return <ReceptionistDashboard />;

      default:
        return renderDashboard();
    }
  };

  return (
    <HospitalLayout
      currentTab={currentView}
      onTabChange={(tab) => {
        setCurrentView(tab);
        window.location.hash = tab;
      }}
      onSearch={(query) => {
        // Direct search to master patients index
        setCurrentView('patients');
        window.location.hash = 'patients';
      }}
    >
      {renderContent()}

      {/* Floating Hospital Real-Time Toast */}
      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          onDismiss={dismissToast}
        />
      )}
    </HospitalLayout>
  );
};

export default App;
