import { AlertCircle, LogOut, Vote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigateToVoting: () => void;
}

export default function DashboardPage({ onNavigateToVoting }: DashboardPageProps) {
  const { voter, constituency, logout } = useAuth();

  if (!voter || !constituency) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Vote className="w-6 h-6 text-slate-700" />
            <span className="font-bold text-slate-800">Electoral System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{voter.name}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Voter Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
              <p className="text-lg font-semibold text-slate-800">{voter.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Voter ID</label>
              <p className="text-lg font-semibold text-slate-800 font-mono">{voter.voter_id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Registered Constituency</label>
              <p className="text-lg font-semibold text-slate-800">
                {constituency.name}, {constituency.state}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Voting Status</label>
              <p className={`text-lg font-semibold ${voter.has_voted ? 'text-green-600' : 'text-amber-600'}`}>
                {voter.has_voted ? 'Vote Cast' : 'Not Voted'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Vote from Anywhere</h3>
              <p className="text-blue-800">
                You may cast your vote from any location. Your vote will be securely mapped to your registered constituency: <strong>{constituency.name}</strong>.
              </p>
            </div>
          </div>
        </div>

        {!voter.has_voted && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Ready to Vote?</h3>
            <p className="text-slate-600 mb-6">
              Click the button below to proceed to the voting screen. Once you submit your vote, it cannot be modified.
            </p>
            <button
              onClick={onNavigateToVoting}
              className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition inline-flex items-center space-x-2"
            >
              <Vote className="w-5 h-5" />
              <span>Proceed to Cast Vote</span>
            </button>
          </div>
        )}

        {voter.has_voted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Thank You for Voting!</h3>
            <p className="text-green-800">
              Your vote has been successfully recorded and will be counted towards the election results in your registered constituency.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
