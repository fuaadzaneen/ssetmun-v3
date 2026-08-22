export interface Round {
  id: string;
  name: string;
  slug: 'priority' | 'r1' | 'r2';
  sheet_id: string;
  sheet_name: string;
  payment_sheet_name?: string;
  fee_tiers: {
    name: string;
    price: number;
    payment_url: string;
  }[];
  deadline_date?: string;
  custom_message?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CampusAmbassador {
  id: string;
  code: string;
  name: string;
  college: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface CommitteePreference {
  committee: string;
  portfolios: string[];
}

export interface Delegate {
  id: string;
  round_id: string;
  name: string;
  dob?: string;
  email: string;
  whatsapp: string;
  college: string;
  course?: string;
  delegation_type: string;
  muns_attended?: string;
  mun_achievements?: string;
  accommodation_required?: string;
  food_preference?: string;
  travel_assistance?: string;
  queries_suggestions?: string;
  raw_ca_input?: string;
  resolved_ca_id?: string | null;
  resolved_ca?: CampusAmbassador | null;
  committee_preferences?: CommitteePreference[];
  status: 'Registered' | 'Allotted' | 'Confirmed' | 'Cancelled';
  pass_tier?: string;
  current_committee?: string | null;
  current_country?: string | null;
  latest_email_status: 'none' | 'pending' | 'sent' | 'delivered' | 'failed';
  latest_email_sent_at?: string | null;
  latest_email_error?: string;
  payment_status?: 'Paid' | 'Pending';
  // School delegation fields
  school_id?: string | null;
  emergency_contact?: string;
  school_price?: number;
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;
  price_per_delegate: number;
  payment_link: string;
  sheet_id?: string;       // Google Sheet ID for the school's filled template
  sheet_name?: string;     // Sheet tab name (defaults to first visible sheet)
  round_id?: string;
  notes?: string;
  created_at?: string;
  delegate_count?: number; // computed on fetch
}

export interface Allotment {
  id: string;
  delegate_id: string;
  committee: string;
  country: string;
  pass_tier?: string;
  assigned_by: string;
  notes?: string;
  is_current: boolean;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  round_id: string;
  name: string;
  subject: string;
  html_content: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailLog {
  id: string;
  delegate_id: string;
  round_id: string;
  template_name: string;
  recipient_email: string;
  provider_message_id?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
  sent_at: string;
}
