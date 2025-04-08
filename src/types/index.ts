export interface Player {
  id: string;
  user_id: string;
  name: string;
  age: number;
  games: string[];
  platforms: string[];
  level: string;
  availability: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  matched_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  games: Game[];
  preferences: {
    gameTypes: ('competitive' | 'casual' | 'coop')[];
    playStyle: ('aggressive' | 'defensive' | 'balanced')[];
    availability: {
      timezone: string;
      schedule: {
        [key: string]: {
          start: string;
          end: string;
        }[];
      };
    };
  };
  stats: {
    [gameId: string]: {
      rank?: string;
      level?: number;
      winRate?: number;
      playTime?: number;
    };
  };
  createdAt: Date;
  lastActive: Date;
}

export interface Game {
  id: string;
  name: string;
  genre: string | null;
  platform: string[];
  created_at: string;
  updated_at: string;
}

export interface UserGame {
  user_id: string;
  game_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

// Extended types for UI
export interface UserWithGames extends User {
  games: Game[];
}

export interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

export interface MessageWithSender extends Message {
  sender: User;
} 