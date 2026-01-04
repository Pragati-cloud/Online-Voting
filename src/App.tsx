import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import DashboardPage from './pages/DashboardPage';
import VotingPage from './pages/VotingPage';

type Page = 'login' | 'otp' | 'dashboard' | 'voting';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [pendingVoterId, setPendingVoterId] = useState('');
  const { voter, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && voter) {
      setCurrentPage('dashboard');
    }
  }, [voter, isLoading]);

  const handleLoginInitiated = (voterId: string) => {
    setPendingVoterId(voterId);
    setCurrentPage('otp');
  };

  const handleOTPVerified = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigateToVoting = () => {
    setCurrentPage('voting');
  };

  const handleVoteCast = () => {
    if (voter) {
      const updatedVoter = { ...voter, has_voted: true };
      sessionStorage.setItem('voter', JSON.stringify(updatedVoter));
    }
    setCurrentPage('dashboard');
    window.location.reload();
  };

  const handleBackToLogin = () => {
    setPendingVoterId('');
    setCurrentPage('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return <LoginPage onLoginInitiated={handleLoginInitiated} />;
  }

  if (currentPage === 'otp') {
    return (
      <OTPVerificationPage
        voterId={pendingVoterId}
        onVerified={handleOTPVerified}
        onBack={handleBackToLogin}
      />
    );
  }

  if (currentPage === 'dashboard') {
    return <DashboardPage onNavigateToVoting={handleNavigateToVoting} />;
  }

  if (currentPage === 'voting') {
    return <VotingPage onVoteCast={handleVoteCast} />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
