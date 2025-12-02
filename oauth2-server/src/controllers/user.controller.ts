import { Request, Response, NextFunction } from 'express';
import { CREATED, SuccessResponse } from '../core/success.response';
import ErrorMessage from '../enum/error.message';
import userValidate from '../helpers/validate/user.validate';
import BaseController from './base/base.controller';
import UserService from '../services/user.service';

class UserController extends BaseController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    this.validate(req.body, userValidate.registerValidate);

    await new CREATED({
      ...(await UserService.register(req.body)),
    }).send(req, res);
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    this.validate(req.body, userValidate.login);

    await new SuccessResponse({
      ...(await UserService.login(req.body)),
    }).send(req, res);
  };

  oauthLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    this.validate(req.body, userValidate.login);

    const { username, password, state, client_id, redirect_uri, response_type, scope } = req.body;
    
    const user = await UserService.findUserByUsernameAndPassword(username, password);

    if (!user) {
      res.render('login', { 
        error: 'Invalid username or password',
        client_id: client_id || '',
        redirect_uri: redirect_uri || '',
        state: state || '',
        response_type: response_type || '',
        scope: scope || '',
      });
      return;
    }

    // Lưu userId vào session
    req.session.userId = user.id;
    
    // Tạo lại OAuth authorize URL từ form data
    const oauthParams = new URLSearchParams();
    if (client_id) oauthParams.set('client_id', client_id);
    if (redirect_uri) oauthParams.set('redirect_uri', redirect_uri);
    if (state) oauthParams.set('state', state);
    if (response_type) oauthParams.set('response_type', response_type);
    if (scope) oauthParams.set('scope', scope);

    // Save session trước khi redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        res.status(500).json({ error: 'Session error' });
        return;
      }
      const redirectUrl = `/api/v1/oauth/authorize?${oauthParams.toString()}`;
      res.redirect(redirectUrl);
    });
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await new SuccessResponse({
      ...(await UserService.logout({
        userId: req.user!.userId,
      })),
    }).send(req, res);
  };

  getUserCurrent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await UserService.getCurrentUser(req.user!.userId);

    this.checkDataNotNull(result, ErrorMessage.USER_NOT_FOUND);

    await new SuccessResponse({
      message: '',
      data: result,
    }).send(req, res);
  };
}

export default new UserController();
