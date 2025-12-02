declare module 'oauth2-server' {
  import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

  interface Token {
    accessToken: string;
    accessTokenExpiresAt?: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    scope?: string | string[];
    client: Client | { id: string };
    user: User | { id: string };
  }

  interface Client {
    id: string;
    redirectUris?: string[];
    grants?: string[];
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    [key: string]: any;
  }

  interface User {
    id?: string;
    [key: string]: any;
  }

  interface AuthorizationCode {
    authorizationCode: string;
    expiresAt: Date;
    redirectUri: string;
    scope?: string | string[];
    client: Client | { id: string };
    user: User | { id: string };
  }

  interface Model {
    getAccessToken?(accessToken: string): Promise<Token | null>;
    getClient?(clientId: string, clientSecret?: string): Promise<Client | null>;
    getUser?(username: string, password: string): Promise<User | null>;
    getUserFromClient?(client: Client): Promise<User | null>;
    saveToken?(token: Token, client: Client, user: User): Promise<Token>;
    saveAuthorizationCode?(
      code: any,
      client: any,
      user: any
    ): Promise<AuthorizationCode>;
    getAuthorizationCode?(authorizationCode: string): Promise<AuthorizationCode | null>;
    revokeAuthorizationCode?(code: AuthorizationCode): Promise<boolean>;
    getRefreshToken?(refreshToken: string): Promise<Token | null>;
    revokeToken?(token: Token): Promise<boolean>;
    verifyScope?(token: Token, scope: string | string[]): Promise<boolean>;
    validateScope?(
      user: User,
      client: Client,
      scope: string | string[]
    ): Promise<string | string[] | false>;
    [key: string]: any;
  }

  interface OAuthOptions {
    model: Model;
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    authorizationCodeLifetime?: number;
    allowBearerTokensInQueryString?: boolean;
    allowEmptyState?: boolean;
    authenticateHandler?: {
      handle(request: any, response: any): Promise<User>;
    };
  }

  interface AuthenticateOptions {
    scope?: string | string[];
    addAcceptedScopesHeader?: boolean;
    addAuthorizedScopesHeader?: boolean;
    allowBearerTokensInQueryString?: boolean;
  }

  interface AuthorizeOptions {
    authenticateHandler?: {
      handle(request: any, response: any): Promise<User | { id: string }>;
    };
    allowEmptyState?: boolean;
    authorizationCodeLifetime?: number;
  }

  interface TokenOptions {
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    allowExtendedTokenAttributes?: boolean;
    alwaysIssueNewRefreshToken?: boolean;
  }

  class Request {
    constructor(request: ExpressRequest | any);
    body: any;
    headers: any;
    method: string;
    query: any;
  }

  class Response {
    constructor(response: ExpressResponse | any);
    body: any;
    headers: any;
    status: number;
  }

  class OAuth2Server {
    constructor(options: OAuthOptions);

    authenticate(
      request: Request,
      response: Response,
      options?: AuthenticateOptions
    ): Promise<Token>;

    authorize(
      request: Request,
      response: Response,
      options?: AuthorizeOptions
    ): Promise<AuthorizationCode>;

    token(
      request: Request,
      response: Response,
      options?: TokenOptions
    ): Promise<Token>;

    static Request: typeof Request;
    static Response: typeof Response;
  }

  export = OAuth2Server;
}
