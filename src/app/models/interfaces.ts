export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  emergency_level?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactGroupCreate {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  emergency_level?: string;
}

export interface ContactGroupUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  emergency_level?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone_number: string;
  priority?: number;
  is_active?: boolean;
  role?: string;
  department?: string;
  group_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  id: string;
  name: string;
  phone_number: string;
  priority?: number;
  is_active?: boolean;
  role?: string;
  department?: string;
  group_ids: string[];
}

export interface ContactUpdate {
  name?: string;
  phone_number?: string;
  priority?: number;
  is_active?: boolean;
  role?: string;
  department?: string;
  group_ids?: string[];
}

export interface Trigger {
  id: string;
  name: string;
  trigger_string: string;
  description?: string;
  group_id?: string;
  is_active?: boolean;
  priority?: number;
  custom_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TriggerCreate {
  id: string;
  name: string;
  trigger_string: string;
  description?: string;
  group_id?: string;
  is_active?: boolean;
  priority?: number;
  custom_message?: string;
}

export interface TriggerUpdate {
  name?: string;
  trigger_string?: string;
  description?: string;
  group_id?: string;
  is_active?: boolean;
  priority?: number;
  custom_message?: string;
}

export interface CallLog {
  id: number;
  email_event_id: string;
  contact_id: string;
  phone_number: string;
  call_sid?: string;
  status: string;
  duration?: number;
  attempt_number?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  from_email: string;
  subject?: string;
  body?: string;
  trigger_matched?: string;
  status?: string;
  received_at: string;
  processed_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface StatsCount {
  count: number;
}

export interface ContactGroupStats {
  total_contact_groups: number;
}

export interface ContactStats {
  total_contacts: number;
}

export interface TriggerStats {
  total_active_triggers: number;
}

export interface DailyCallStats {
  total_daily_calls: number;
}