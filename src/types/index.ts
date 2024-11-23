export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  subscription: 'freemium' | 'premium';
  created_at: string;
}

export interface BookBox {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  latitude: number;
  longitude: number;
  creator_id: string;
  creator_username: string;
  created_at: string;
}

export interface Visit {
  id: string;
  box_id: string;
  visitor_id: string;
  comment: string;
  rating: number;
  visited_at: string;
  visitor: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Favorite {
  user_id: string;
  box_id: string;
  created_at: string;
}