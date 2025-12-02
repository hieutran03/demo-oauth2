import { Request } from 'express';

// Express Session extension
declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
  }
}

// Express Request extension
declare module 'express' {
  interface Request {
    requestId?: string;
    requestDateNow?: number;
    user?: {
      userId: string;
      fullName?: string;
    };
    auth?: {
      userId: string;
      sessionType: string;
    };
    currentUserInfo?: IUser;
  }
}

// App Configuration
export interface AppConfig {
  environment: string;
  apptoken: {
    timeout: string | undefined;
    timeout_cache: string | undefined;
  };
  app: {
    appkey: string | undefined;
    port: string | number;
    dbHost: string | undefined;
    dbPort: string | undefined;
    dbUser: string | undefined;
    dbPassword: string | undefined;
    dbDatabase: string | undefined;
  };
}

// User types
export interface IUser {
  id: string;
  username: string;
  fullName?: string;
  password: string;
  user_salt?: string;
  status: 'active' | 'inactive';
  user_address?: string;
  time?: number;
  requried_change_pass?: boolean;
  verify?: boolean;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreate {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  verify?: boolean;
}

// OAuth Client types
export interface IOAuthClient {
  id: string;
  userId?: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  grants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOAuthClientCreate {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  grants?: string[];
  userId?: string;
}

// OAuth Token types
export interface IOAuthAccessToken {
  id: string;
  accessToken: string;
  accessTokenExpiresAt: Date;
  scope?: string;
  clientId: string;
  userId: string;
}

export interface IOAuthRefreshToken {
  id: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  scope?: string;
  clientId: string;
  userId: string;
}

export interface IOAuthAuthorizationCode {
  id: string;
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  scope?: string;
  clientId: string;
  userId: string;
}

// OAuth2 Server Model types
export interface OAuth2Client {
  id: string;
  grants: string[];
  redirectUris: string[];
}

export interface OAuth2User {
  id: string;
}

export interface OAuth2Token {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  client: { id: string };
  user: { id: string };
}

export interface OAuth2AuthorizationCode {
  code: string;
  expiresAt: Date;
  redirectUri: string;
  scope?: string;
  client: { id: string };
  user: { id: string };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: number;
}

export interface PaginationResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Error types
export interface ApiError {
  status: number;
  message: string;
  stack?: string;
}
