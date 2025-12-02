import { v4 as uuid } from 'uuid';
import OAuthClient from '../models/oauth_client.model';
import OAuthAccessToken from '../models/oauth_access_token.model';
import OAuthRefreshToken from '../models/oauth_refresh_token.model';
import OAuthAuthorizationCode from '../models/oauth_authorization_code.model';
import User from '../models/user.model';
import { IOAuthClientCreate, OAuth2Client, OAuth2User, OAuth2Token, OAuth2AuthorizationCode } from '../types';

// Get client by clientId
export const getClientById = async (clientId: string): Promise<OAuthClient | null> => {
  return OAuthClient.findOne({ where: { clientId } });
};

// Get user for authorization
export const getUserForAuthorization = async ({
  sessionUserId,
  clientUserId,
}: {
  sessionUserId?: string;
  clientUserId?: string;
}): Promise<User | null> => {
  if (clientUserId) {
    return User.findOne({ where: { id: clientUserId } });
  }
  return User.findOne({ where: { id: sessionUserId } });
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  return User.findOne({ where: { id: userId } });
};

// Get client (OAuth2 Server model interface)
export async function getClient(clientId: string, clientSecret?: string): Promise<OAuth2Client | null> {
  const query: any = { where: { clientId } };
  if (clientSecret) {
    query.where.clientSecret = clientSecret;
  }

  const client = await OAuthClient.findOne(query);
  if (!client) return null;

  return {
    id: client.clientId,
    grants: client.grants,
    redirectUris: [client.callbackUrl],
  };
}

// Save authorization code
export async function saveAuthorizationCode(
  code: { authorizationCode: string; expiresAt: Date; redirectUri: string; scope?: string },
  client: { id: string },
  user: { id: string }
): Promise<OAuth2AuthorizationCode> {
  await OAuthAuthorizationCode.create({
    id: uuid(),
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    clientId: client.id,
    userId: user.id,
  });

  return {
    ...code,
    code: code.authorizationCode,
    client: { id: client.id },
    user: { id: user.id },
  };
}

// Get authorization code
export async function getAuthorizationCode(authorizationCode: string): Promise<OAuth2AuthorizationCode | null> {
  const code = await OAuthAuthorizationCode.findOne({ where: { authorizationCode } });
  if (!code) return null;

  return {
    code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    client: { id: code.clientId },
    user: { id: code.userId },
  };
}

// Revoke authorization code
export async function revokeAuthorizationCode({ code }: { code: string }): Promise<boolean> {
  const res = await OAuthAuthorizationCode.destroy({ where: { authorizationCode: code } });
  return res === 1;
}

// Revoke token
export async function revokeToken(token: string, tokenTypeHint?: string): Promise<boolean> {
  if (!token) return false;

  switch (tokenTypeHint) {
    case 'refresh_token':
      return (await OAuthRefreshToken.destroy({ where: { refreshToken: token } })) > 0;
    case 'access_token':
    default:
      return (await OAuthAccessToken.destroy({ where: { accessToken: token } })) > 0;
  }
}

// Save token
export async function saveToken(
  token: {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    scope?: string;
  },
  client: { id: string },
  user: { id: string }
): Promise<OAuth2Token> {
  await OAuthAccessToken.create({
    id: uuid(),
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    scope: token.scope,
    clientId: client.id,
    userId: user.id,
  });

  if (token.refreshToken && token.refreshTokenExpiresAt) {
    await OAuthRefreshToken.create({
      id: uuid(),
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      clientId: client.id,
      userId: user.id,
    });
  }

  return {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    scope: token.scope,
    client: { id: client.id },
    user: { id: user.id },
  };
}

// Get access token
export async function getAccessToken(accessToken: string): Promise<OAuth2Token | null> {
  const token = await OAuthAccessToken.findOne({ where: { accessToken } });
  if (!token) return null;

  return {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    scope: token.scope,
    client: { id: token.clientId },
    user: { id: token.userId },
  };
}

// Get refresh token
export async function getRefreshToken(refreshToken: string): Promise<OAuth2Token | null> {
  const token = await OAuthRefreshToken.findOne({ where: { refreshToken } });
  if (!token) return null;

  return {
    accessToken: '', // Not available from refresh token
    accessTokenExpiresAt: new Date(),
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    scope: token.scope,
    client: { id: token.clientId },
    user: { id: token.userId },
  };
}

// Create default OAuth client
export async function createDefaultOAuthClient(): Promise<void> {
  const defaultClientId = 'test-client-id';
  const defaultClientSecret = 'test-client-secret';

  const existing = await OAuthClient.findOne({ where: { clientId: defaultClientId } });
  if (!existing) {
    await OAuthClient.create({
      id: uuid(),
      clientId: defaultClientId,
      clientSecret: defaultClientSecret,
      grants: ['authorization_code', 'refresh_token'],
      callbackUrl: 'http://localhost:3000/callback',
    });
    console.log('Default OAuth client created.');
  } else {
    console.log('Default OAuth client already exists.');
  }
}

// Create client
export async function createClient(data: IOAuthClientCreate): Promise<OAuthClient> {
  const existing = await OAuthClient.findOne({ where: { clientId: data.clientId } });
  if (existing) {
    throw new Error('Client ID already exists');
  }

  return OAuthClient.create({
    id: uuid(),
    clientId: data.clientId,
    clientSecret: data.clientSecret,
    callbackUrl: data.callbackUrl,
    grants: data.grants || ['authorization_code', 'refresh_token'],
    userId: data.userId,
  });
}

// Get client list
export async function getClientList(): Promise<OAuthClient[]> {
  return OAuthClient.findAll({
    attributes: ['id', 'clientId', 'callbackUrl', 'grants', 'userId', 'createdAt'],
  });
}

// Delete client
export async function deleteClient(clientId: string): Promise<boolean> {
  const result = await OAuthClient.destroy({ where: { clientId } });
  return result > 0;
}

// Export as model for oauth2-server
export default {
  getClient,
  saveAuthorizationCode,
  getAuthorizationCode,
  revokeAuthorizationCode,
  saveToken,
  getAccessToken,
  getRefreshToken,
  getClientById,
  getUserForAuthorization,
  getUserById,
  revokeToken,
  createDefaultOAuthClient,
  createClient,
  getClientList,
  deleteClient,
};
