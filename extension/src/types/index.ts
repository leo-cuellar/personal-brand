/**
 * TypeScript types for the extension
 */

export interface InspirationData {
  text: string;
  link: string;
  personId?: string;
}

export interface Message {
  type: "ADD_INSPIRATION" | "GET_CONFIG" | "SET_CONFIG";
  data?: InspirationData | unknown;
}

export interface LinkedInPost {
  text: string;
  author: string;
  link: string;
  timestamp?: string;
}

