import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  fullName?: string;
}

export const createTokenPair = async ({
  payload,
  privateKey,
}: {
  payload: TokenPayload;
  privateKey: string;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = jwt.sign(payload, privateKey, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign(payload, privateKey, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const createTokenPairForgotPass = async ({
  payload,
  privateKey,
}: {
  payload: TokenPayload;
  privateKey: string;
}): Promise<{ accessToken: string }> => {
  const accessToken = jwt.sign(payload, privateKey, {
    expiresIn: '15m',
  });

  return { accessToken };
};

export const verifyToken = (token: string, privateKey: string): TokenPayload => {
  return jwt.verify(token, privateKey) as TokenPayload;
};
