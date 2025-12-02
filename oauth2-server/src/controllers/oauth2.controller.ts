import { Request, Response, NextFunction } from 'express';
import OAuth2Server from 'oauth2-server';
import { SuccessResponse, CREATED } from '../core/success.response';
import { BadRequestError } from '../core/error.response';
import BaseController from './base/base.controller';
import OAuthService, {
  getClientById,
  getUserForAuthorization,
  getUserById,
  revokeToken,
  createClient,
  getClientList,
  deleteClient,
} from '../services/oauth.service';
import ErrorMessage from '../enum/error.message';

const OAuthRequest = OAuth2Server.Request;
const OAuthResponse = OAuth2Server.Response;

class OAuth2Controller extends BaseController {
  private server: OAuth2Server;

  constructor() {
    super();
    this.server = new OAuth2Server({
      model: OAuthService as any,
    });
  }

  authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { client_id, state, response_type, redirect_uri, scope } = req.query as { 
        client_id?: string; 
        state?: string;
        response_type?: string;
        redirect_uri?: string;
        scope?: string;
      };
      
      if (!client_id || !state) {
        throw new BadRequestError('Missing client_id or state');
      }

      // Kiểm tra xem user đã login chưa (lưu trong session)
      const sessionUserId = req.session.userId;

      if (!sessionUserId) {
        // Chưa login -> redirect đến trang login với đầy đủ OAuth params
        const queryParams = new URLSearchParams(req.query as any).toString();
        const loginUrl = `/api/v1/oauth/login?${queryParams}`;
        res.redirect(loginUrl);
        return;
      }

      const request = new OAuthRequest(req);
      const response = new OAuthResponse(res);

      const result = await this.server.authorize(request, response, {
        authenticateHandler: {
          handle: async () => {
            const client = await getClientById(client_id);
            if (!client) {
              throw new BadRequestError('Client not found');
            }

            const user = await getUserForAuthorization({
              sessionUserId,
              clientUserId: client.userId,
            });

            if (!user) {
              throw new BadRequestError('User not found after login');
            }
            return { id: user.id };
          },
        },
      });

      // OAuth2 authorize thành công -> redirect về client với authorization code
      const redirectUrl = new URL(redirect_uri!);
      redirectUrl.searchParams.set('code', result.authorizationCode);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      
      console.log('Redirecting to client with code:', redirectUrl.toString());
      res.redirect(redirectUrl.toString());
    } catch (err: any) {
      console.log('Authorize error:', err);
      
      // Nếu có redirect_uri, redirect về với error
      const redirect_uri = req.query.redirect_uri as string;
      const state = req.query.state as string;
      
      if (redirect_uri) {
        try {
          const errorUrl = new URL(redirect_uri);
          errorUrl.searchParams.set('error', err.message || 'server_error');
          if (state) {
            errorUrl.searchParams.set('state', state);
          }
          res.redirect(errorUrl.toString());
          return;
        } catch (urlErr) {
          // Invalid redirect_uri, fall through to JSON response
        }
      }
      
      res.status(err.code || 500).json(
        err instanceof Error ? { error: err.message } : err
      );
    }
  };

  token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = new OAuthRequest(req);
      const response = new OAuthResponse(res);

      const result = await this.server.token(request, response, {
        alwaysIssueNewRefreshToken: false,
      });

      await new SuccessResponse({
        message: 'Token issued',
        data: result,
      }).send(req, res);
    } catch (err: any) {
      console.log('Token error:', err);
      res.status(err.code || 500).json(
        err instanceof Error ? { error: err.message } : err
      );
    }
  };

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = new OAuthRequest(req);
      const response = new OAuthResponse(res);

      const data = await this.server.authenticate(request, response);

      req.auth = {
        userId: data?.user?.id || '',
        sessionType: 'oauth2',
      };

      next();
    } catch (err: any) {
      console.log('Authentication error:', err);
      res.status(err.code || 500).json(
        err instanceof Error ? { error: err.message } : err
      );
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, token_type_hint } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Missing token' });
        return;
      }

      const revoked = await revokeToken(token, token_type_hint);

      if (!revoked) {
        res.status(400).json({ error: 'Token not found or already revoked' });
        return;
      }

      res.status(200).json({ success: revoked, message: 'Token revoked' });
    } catch (err) {
      console.error('Revoke error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  test = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.auth || {};
    if (!userId) {
      throw new BadRequestError(ErrorMessage.USER_NOT_FOUND);
    }

    const user = await getUserById(userId);
    this.checkDataNotNull(user, ErrorMessage.USER_NOT_FOUND);

    await new SuccessResponse({
      message: 'User authenticated',
      data: {
        id: user!.id,
        username: user!.username,
      },
    }).send(req, res);
  };

  createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId, clientSecret, callbackUrl, grants } = req.body;

      if (!clientId || !clientSecret || !callbackUrl) {
        res.status(400).json({
          error: 'Missing required fields: clientId, clientSecret, callbackUrl',
        });
        return;
      }

      const client = await createClient({
        clientId,
        clientSecret,
        callbackUrl,
        grants,
      });

      await new CREATED({
        message: 'Client registered successfully',
        data: client,
      }).send(req, res);
    } catch (err: any) {
      if (err.message === 'Client ID already exists') {
        res.status(409).json({ error: err.message });
        return;
      }
      console.error('Create client error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getClientList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clients = await getClientList();

      await new SuccessResponse({
        message: 'Client list retrieved',
        data: clients,
      }).send(req, res);
    } catch (err) {
      console.error('Get client list error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.params;

      const deleted = await deleteClient(clientId);

      if (!deleted) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      await new SuccessResponse({
        message: 'Client deleted successfully',
      }).send(req, res);
    } catch (err) {
      console.error('Delete client error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

export default new OAuth2Controller();
