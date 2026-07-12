import { useContext } from 'react';
import { StateProvider, StateContext } from './context/StateContext';
import LoginSignupPage from './components/LoginSignupPage';

function AppContent() {
  const { currentUser } = useContext(StateContext);

  if (!currentUser) {
    return <LoginSignupPage />;
  }

  // Dashboard shell will go here later
  return (
    <div style={{ padding: 40, fontFamily: "'IBM Plex Sans', sans-serif", color: '#16233D' }}>
      <h1>Welcome, {currentUser.name}!</h1>
      <p>Role: {currentUser.role} | Department: {currentUser.department}</p>
      <p style={{ marginTop: 12, color: '#5B6B82', fontSize: 14 }}>
        Dashboard views coming next. For now the login/signup flow is live.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
