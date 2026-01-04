export interface Constituency {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

export interface Voter {
  id: string;
  voter_id: string;
  name: string;
  email: string;
  mobile: string;
  constituency_id: string;
  has_voted: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  party_name: string;
  constituency_id: string;
  created_at: string;
}

export interface OTP {
  id: string;
  voter_id: string;
  otp_code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  candidate_id: string;
  constituency_id: string;
  cast_at: string;
}
