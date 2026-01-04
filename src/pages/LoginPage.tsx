import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLoginInitiated: (voterId: string, contact: string) => void;
}

export default function LoginPage({ onLoginInitiated }: LoginPageProps) {
  const [voterId, setVoterId] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: voter } = await supabase
        .from('voters')
        .select('*')
        .eq('voter_id', voterId.toUpperCase())
        .maybeSingle();

      if (!voter) {
        setError('Voter ID not found. Please check and try again.');
        setLoading(false);
        return;
      }

      if (voter.email !== contact && voter.mobile !== contact) {
        setError('Contact information does not match our records.');
        setLoading(false);
        return;
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await supabase
        .from('otps')
        .insert({
          voter_id: voter.id,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      console.log(`OTP Generated: ${otpCode} (In production, this would be sent via SMS/Email)`);
      alert(`OTP sent to your registered contact!\n\nDemo OTP: ${otpCode}\n(In production, this would be sent via SMS/Email)`);

      onLoginInitiated(voter.id, otpCode);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Unified Electoral Roll & Voter Mobility System
            </h1>
            <p className="text-slate-200 text-center text-sm">
              A secure and accessible voting platform
            </p>
          </div>

          <div className="px-6 py-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="voterId" className="block text-sm font-medium text-slate-700 mb-2">
                  Voter ID Number
                </label>
                <input
                  id="voterId"
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your Voter ID"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-2">
                  Registered Email or Mobile Number
                </label>
                <input
                  id="contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                  placeholder="Email or Mobile"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Identity'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Your information is encrypted and securely verified. We use industry-standard security protocols to protect your identity.
              </p>
            </form>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex justify-center space-x-4 text-xs text-slate-600">
              <a href="#" className="hover:text-slate-900">Privacy Policy</a>
              <span className="text-slate-400">•</span>
              <a href="#" className="hover:text-slate-900">Help</a>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Authorized by the Election Commission
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <div className="text-xs text-blue-700 space-y-1 font-mono">
            <div>Voter ID: <strong>VOT001234</strong></div>
            <div>Email: <strong>rajesh.kumar@email.com</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
