export interface User {
    user_id: string; // UUID
    username: string;
    email: string;
    profile_picture?: string | null;
    bio?: string | null;
    createdAt?: string;
    updatedAt?: string;

    posts?: Post[];
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
  }
  
  export interface Category {
    category_id: string; // UUID
    category_name: string;
    createdAt?: string;
  }
  
  export interface Post {
    post_id: string; // UUID
    user_id: string; // UUID
    image_url: string;
    caption: string;
    category_id: string; // UUID
    createdAt?: string;
    updatedAt?: string;
    
    user?: User;
    category?: Category;
    likes_count?: number;
    comments_count?: number;
    is_liked?: boolean;
    recent_likes?: number; 
    is_bookmarked?: boolean;
  }
  
  export interface Comment {
    comment_id: string; // UUID
    user_id: string; // UUID
    post_id: string; // UUID
    content: string;
    createdAt?: string;
    updatedAt?: string;
    
    user?: User;
  }
  
  export interface Collection {
    collection_id: string; // UUID
    user_id: string; // UUID
    collection_name: string;
    createdAt?: string;
    
    posts_count?: number;
  }
  
  export interface CollectionPost {
    collection_post_id: string; // UUID
    collection_id: string; // UUID
    post_id: string; // UUID
    createdAt?: string;
    
    post?: Post;
  }