export interface WikiWish {
  id: number;
  status: 'under-review' | 'community-opportunity' | 'needs-clarification' | 'completed' | 'declined';
  type: 'feature' | 'change' | 'unknown';
  title: string;
  description: string;
  tags: string[];
  focusArea: string;
  votecount: number;
  created: string;
  updated: string;
  crwns: number;
  crwtitle: string;
  author?: string;
  supporters?: Supporter[];
}

export interface Supporter {
  username: string;
  timestamp?: string;
  comment?: string;
  link?: string;
}

export interface WishDetail extends WikiWish {
  description: string;
  focusArea: string;
  affectedUsers: string[];
  otherDetails: string[];
  author: string;
  supporters: Supporter[];
}

export interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
  talkPage?: string;
}

export interface UserStatistics {
  created: number;
  supported: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  continueToken?: string;
}
