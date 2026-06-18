export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: string | null;
  current_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
}
