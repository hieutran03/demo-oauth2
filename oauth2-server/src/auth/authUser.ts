import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../core/error.response';
import asyncHandler from '../helpers/asyncHandler';
import ErrorMessage from '../enum/error.message';
import UserService from '../services/user.service';

export const isCurrentUser = () => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new BadRequestError(ErrorMessage.USER_NOT_FOUND));
    }
    
    const foundUser = await UserService.findUserByIdLean(userId);
    
    if (!foundUser) {
      return next(new BadRequestError(ErrorMessage.USER_NOT_FOUND));
    }
    
    req.currentUserInfo = foundUser;
    return next();
  });
};

export default {
  isCurrentUser,
};
