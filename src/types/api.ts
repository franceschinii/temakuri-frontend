export interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
  avatarIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  saborTriggers: number;
  tricksWon: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
