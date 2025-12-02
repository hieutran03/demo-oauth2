export interface AppConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  oauthServerUrl: string;
  port: number;
}

export interface TokenData {
  accessToken: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface UserData {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
}

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    tokens?: TokenData;
    user?: UserData;
    [key: string]: any;
  }
}
