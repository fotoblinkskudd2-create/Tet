export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  rating: number;
  stats: UserStats;
}

export const users = new Map<string, User>();
