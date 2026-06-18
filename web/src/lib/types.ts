import type { Medium } from "./prompt-engine";

export type Prompt = {
  id: string;
  user_id: string;
  author_name: string | null;
  medium: Medium;
  seed: string;
  body: string;
  details: string[];
  is_public: boolean;
  likes: number;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  plan: "free" | "pro";
  onboarded: boolean;
  created_at: string;
};
