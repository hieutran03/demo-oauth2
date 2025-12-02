import crypto from 'crypto';
import { getInfoData } from '../utils';
import { AppStatus } from '../enum/app.enum';
import { createTokenPair } from '../auth/authUtils';
import { BadRequestError, ConflictResponse, NotFoundError } from '../core/error.response';
import ErrorMessage from '../enum/error.message';
import { findUserByUsername, createUser, findUserDetaiById } from '../models/repositories/user.repo';
import KeyTokenService from './keyToken.service';
import User from '../models/user.model';
import { IUserCreate } from '../types';

const USER_FILED_RETURN = [
  'id',
  'username',
  'fullName',
  'status',
  'email',
  'phone',
  'updatedAt',
];

const LOGIN_FILED_RETURN = [
  'id',
  'username',
  'fullName',
  'status',
  'email',
  'phone',
];

class UserService {
  static async checkExists({
    userId,
    message = ErrorMessage.USER_NOT_FOUND,
    checkActive = true,
  }: {
    userId: string;
    message?: string;
    checkActive?: boolean;
  }): Promise<User> {
    const foundUser = await findUserDetaiById(userId);
    if (!foundUser) {
      throw new BadRequestError(message);
    }
    if (checkActive && foundUser.status !== AppStatus.active) {
      throw new BadRequestError(ErrorMessage.USER_IS_DEACTIVED);
    }
    return foundUser;
  }

  static async checkExistsByUsername({
    username,
    message = ErrorMessage.USER_NOT_FOUND,
    checkActive = true,
  }: {
    username: string;
    message?: string;
    checkActive?: boolean;
  }): Promise<User> {
    const foundUser = await findUserByUsername({ username });
    if (!foundUser) {
      throw new BadRequestError(message);
    }
    if (checkActive && foundUser.status !== AppStatus.active) {
      throw new BadRequestError(ErrorMessage.USER_IS_DEACTIVED);
    }
    return foundUser;
  }

  static async removeKeyToken(userId: string): Promise<void> {
    await KeyTokenService.deleteKeyByUserId(userId);
  }

  static async register(body: IUserCreate) {
    const { username, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new BadRequestError(ErrorMessage.PASSWORD_NOT_MATCH);
    }

    const foundUser = await findUserByUsername({ username });
    if (foundUser) {
      throw new ConflictResponse(ErrorMessage.USER_ALREADY_EXISTS);
    }

    const user = await createUser({
      ...body,
      verify: true,
    } as any);

    if (!user) {
      throw new BadRequestError(ErrorMessage.CREATE_USER_ERROR);
    }

    return {
      success: true,
      message: ErrorMessage.USER_CREATED,
      data: getInfoData({
        object: user,
        fields: USER_FILED_RETURN,
      }),
    };
  }

  static async findUserByUsernameAndPassword(username: string, password: string): Promise<User | null> {
    const user = await findUserByUsername({ username, raw: false });
    if (!user) return null;

    const isMatch = await user.isCheckPassword(password);
    return isMatch ? user : null;
  }

  static async login(body: { username: string; password: string }) {
    const { username, password } = body;
    const foundUser = await findUserByUsername({ username, raw: false });
    
    if (!foundUser) {
      throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
    }

    const isValid = await foundUser.isCheckPassword(password);
    if (!isValid) {
      throw new BadRequestError(ErrorMessage.WRONG_PASSWORD);
    }

    if (foundUser.status !== AppStatus.active) {
      throw new NotFoundError(ErrorMessage.ACCOUNT_HAS_BEEN_DELETED);
    }

    const privateKey = crypto.randomBytes(64).toString('hex');
    const { id: userId, fullName } = foundUser;

    const tokens = await createTokenPair({
      payload: { userId, fullName },
      privateKey,
    });

    await KeyTokenService.createKeyToken({ privateKey, userId });

    return {
      success: true,
      message: ErrorMessage.LOGIN_SUCCESS,
      data: {
        userInfo: getInfoData({
          object: foundUser,
          fields: LOGIN_FILED_RETURN,
        }),
        ...tokens,
      },
    };
  }

  static async logout({ userId }: { userId: string }) {
    await UserService.removeKeyToken(userId);
    return {
      success: true,
      message: ErrorMessage.LOGOUT_SUCCESS,
    };
  }

  static async getCurrentUser(userId: string) {
    return findUserDetaiById(userId);
  }

  static async findUserByIdLean(userId: string) {
    return findUserDetaiById(userId);
  }
}

export default UserService;
