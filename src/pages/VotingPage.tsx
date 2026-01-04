import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Candidate } from '../types';

interface VotingPageProps {
  onVoteCast: () => void;
}

export default function VotingPage({ onVoteCast }: VotingPageProps) {
  const { voter, constituency } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    if (!voter || !constituency) return;

    try {
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('constituency_id', constituency.id)
        .order('name');

      if (data) {
        setCandidates(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate || !voter || !constituency) return;

    setSubmitting(true);
    setError('');

    try {
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          voter_id: voter.id,
          candidate_id: selectedCandidate,
          constituency_id: constituency.id
        });

      if (voteError) {
        if (voteError.message.includes('duplicate')) {
          setError('You have already cast your vote.');
        } else {
          throw voteError;
        }
        setSubmitting(false);
        return;
      }

      await supabase
        .from('voters')
        .update({ has_voted: true })
        .eq('id', voter.id);

      onVoteCast();
    } catch (err) {
      console.error(err);
      setError('Failed to submit vote. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-2">Cast Your Vote</h1>
            <p className="text-slate-200 text-center text-sm">
              {constituency?.name}, {constituency?.state}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-slate-600 mb-6">
              Select your preferred candidate from the list below:
            </p>

            <div className="space-y-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedCandidate === candidate.id
                      ? 'border-slate-700 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-5 h-5 text-slate-700 focus:ring-slate-500"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-slate-800 text-lg">{candidate.name}</p>
                    <p className="text-slate-600 text-sm">{candidate.party_name}</p>
                  </div>
                  {selectedCandidate === candidate.id && (
                    <CheckCircle className="w-6 h-6 text-slate-700" />
                  )}
                </label>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Once submitted, your vote cannot be modified or withdrawn. Please review your selection carefully.
              </p>
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || submitting}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-4 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
