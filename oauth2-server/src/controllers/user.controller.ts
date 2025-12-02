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

    const { username, password, state } = req.body;
    const user = await UserService.findUserByUsernameAndPassword(username, password);

    if (!user) {
      res.render('login', { error: 'Invalid username or password' });
      return;
    }

    const originalQuery = req.session[`${state}_authkey`];
    if (!originalQuery || !originalQuery.client_id) {
      res.status(400).json({ error: 'Missing original OAuth2 query' });
      return;
    }

    const clientId = originalQuery.client_id;
    req.session[`${clientId}_${state}`] = user.id;

    delete req.session[`${state}_authkey`];

    const redirectUrl = `/api/v1/oauth/authorize?${new URLSearchParams(originalQuery).toString()}`;
    res.redirect(redirectUrl);
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
