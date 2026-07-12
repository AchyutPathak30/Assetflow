import { useContext, useState } from 'react';
import { StateProvider, StateContext } from './context/StateContext';
import LoginSignupPage from './components/LoginSignupPage';
import CursorEffect from './components/CursorEffect';
import DashboardPage from './components/DashboardPage';
import AssetDirectoryPage from './components/AssetDirectoryPage';
import AllocationTransferPage from './components/AllocationTransferPage';
import ResourceBookingPage from './components/ResourceBookingPage';
import MaintenancePage from './components/MaintenancePage';
import AuditCyclePage from './components/AuditCyclePage';
import ReportsPage from './components/ReportsPage';

function AppContent() {
  const { currentUser } = useContext(StateContext);
  const [activeNav, setActiveNav] = useState('dashboard');

  if (!currentUser) {
    return <LoginSignupPage />;
  }

  const props = { activeNav, setActiveNav };

  switch (activeNav) {
    case 'assets':      return <AssetDirectoryPage {...props} />;
    case 'allocation':  return <AllocationTransferPage {...props} />;
    case 'booking':     return <ResourceBookingPage {...props} />;
    case 'maintenance': return <MaintenancePage {...props} />;
    case 'audit':       return <AuditCyclePage {...props} />;
    case 'reports':     return <ReportsPage {...props} />;
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
