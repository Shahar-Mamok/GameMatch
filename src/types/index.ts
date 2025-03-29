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
  type: 'competitive' | 'casual' | 'coop';
  platforms: ('pc' | 'ps5' | 'xbox' | 'switch' | 'mobile')[];
  genres: string[];
  imageUrl: string;
  description: string;
  releaseDate: Date;
  activePlayers: number;
  rating: number;
}

export interface Match {
  id: string;
  users: string[]; // Array of user IDs
  game: string; // Game ID
  status: 'pending' | 'accepted' | 'rejected';
  matchScore: number; // Compatibility score
  createdAt: Date;
  lastInteraction: Date;
  chatId?: string; // Reference to chat if accepted
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'gameInvite';
  metadata?: {
    gameId?: string;
    imageUrl?: string;
    timestamp?: Date;
  };
  createdAt: Date;
  read: boolean;
} 