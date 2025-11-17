/**
 * TypeScript types for the extension
 */

export interface InspirationData {
  text: string;
  personalBrandId?: string;
  metadata?: {
    author_profile_name?: string;
    author_profile_url?: string;
  };
}

export interface IdeaData {
  text: string;
  description?: string;
  personalBrandId?: string;
  metadata?: {
    author_profile_name?: string;
    author_profile_url?: string;
    post_url?: string;
    post_date?: string;
  };
}

export interface Message {
  type: "ADD_IDEA" | "ADD_INSPIRATION" | "GET_CONFIG" | "SET_CONFIG";
  data?: IdeaData | InspirationData | unknown;
}

export interface LinkedInPost {
  text: string;
  author: string;
  link: string;
  timestamp?: string;
  metadata?: {
    author_profile_name?: string;
    author_profile_url?: string;
    post_url?: string;
    post_date?: string;
  };
}

