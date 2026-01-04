import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface OTPVerificationPageProps {
  voterId: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPVerificationPage({ voterId, onVerified, onBack }: OTPVerificationPageProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const { setVoter } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const { data: otpRecord } = await supabase
        .from('otps')
        .select('*')
        .eq('voter_id', voterId)
        .eq('otp_code', otpCode)
        .eq('used', false)
        .maybeSingle();

      if (!otpRecord) {
        setError('Invalid OTP. Please check and try again.');
        setLoading(false);
        return;
      }

      const expiresAt = new Date(otpRecord.expires_at);
      if (expiresAt < new Date()) {
        setError('OTP has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      await supabase
        .from('otps')
        .update({ used: true })
        .eq('id', otpRecord.id);

      const { data: voter } = await supabase
        .from('voters')
        .select('*')
        .eq('id', voterId)
        .maybeSingle();

      if (voter) {
        setVoter(voter);
        onVerified();
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-4 rounded-full">
              <Shield className="w-10 h-10 text-slate-700" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Verify Your Identity
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Enter the one-time password sent to your registered contact.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Time remaining: <span className="font-mono font-bold text-slate-800">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </p>
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Resend OTP
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || timer === 0}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
