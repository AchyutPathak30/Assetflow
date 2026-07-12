import { useContext, useState } from 'react';
import { StateProvider, StateContext } from './context/StateContext';
import LandingPage from './components/LandingPage';
import LoginSignupPage from './components/LoginSignupPage';
import CursorEffect from './components/CursorEffect';
import DashboardPage from './components/DashboardPage';
import AssetDirectoryPage from './components/AssetDirectoryPage';
import AllocationTransferPage from './components/AllocationTransferPage';
import ResourceBookingPage from './components/ResourceBookingPage';
import MaintenancePage from './components/MaintenancePage';
import AuditCyclePage from './components/AuditCyclePage';
import ReportsPage from './components/ReportsPage';
import LogsPage from './components/LogsPage';
import OrgSetupPage from './components/OrgSetupPage';

function AppContent() {
  const { currentUser } = useContext(StateContext);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'signup'

  if (!currentUser) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthView('login')}
          onSignup={() => setAuthView('signup')}
        />
      );
    }
    return (
      <LoginSignupPage
        onBackToHome={() => setAuthView('landing')}
        initialMode={authView}
      />
    );
  }

  const props = { activeNav, setActiveNav };

  switch (activeNav) {
    case 'assets':      return <AssetDirectoryPage {...props} />;
    case 'allocation':  return <AllocationTransferPage {...props} />;
    case 'booking':     return <ResourceBookingPage {...props} />;
    case 'maintenance': return <MaintenancePage {...props} />;
    case 'audit':       return <AuditCyclePage {...props} />;
    case 'reports':     return <ReportsPage {...props} />;
    case 'logs':        return <LogsPage {...props} />;
    case 'orgsetup':    return <OrgSetupPage {...props} />;
    default:            return <DashboardPage {...props} />;
  }
}

export default function App() {
  return (
    <StateProvider>
      <CursorEffect />
      <AppContent />
    </StateProvider>
  );
}
