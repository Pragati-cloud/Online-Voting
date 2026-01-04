import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Voter } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  voter: Voter | null;
  constituency: { id: string; name: string; state: string } | null;
  setVoter: (voter: Voter | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [voter, setVoterState] = useState<Voter | null>(null);
  const [constituency, setConstituency] = useState<{ id: string; name: string; state: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedVoter = sessionStorage.getItem('voter');
    if (storedVoter) {
      const voterData = JSON.parse(storedVoter);
      setVoterState(voterData);
      loadConstituency(voterData.constituency_id);
    }
    setIsLoading(false);
  }, []);

  const loadConstituency = async (constituencyId: string) => {
    const { data } = await supabase
      .from('constituencies')
      .select('id, name, state')
      .eq('id', constituencyId)
      .maybeSingle();

    if (data) {
      setConstituency(data);
    }
  };

  const setVoter = (voter: Voter | null) => {
    setVoterState(voter);
    if (voter) {
      sessionStorage.setItem('voter', JSON.stringify(voter));
      loadConstituency(voter.constituency_id);
    } else {
      sessionStorage.removeItem('voter');
      setConstituency(null);
    }
  };

  const logout = () => {
    setVoterState(null);
    setConstituency(null);
    sessionStorage.removeItem('voter');
  };

  return (
    <AuthContext.Provider value={{ voter, constituency, setVoter, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
