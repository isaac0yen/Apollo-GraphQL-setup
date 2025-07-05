import jwt from 'jsonwebtoken';
import 'dotenv/config';

import Validate from './Validate.js';
import ThrowError from './ThrowError.js';
import Logger from './Logger.js';

interface JWTObject {
  access_token: string;
}

export interface TokenPayload {
  id: number;
  [key: string]: string | number;
}

const signJWT = async (object: TokenPayload): Promise<JWTObject | null> => {
  try {
    if (!Validate.object(object) || !Validate.integer(object.id)) {
      Logger.error('Invalid ID passed to signJWT', { object });
      ThrowError('JWT_ERROR');
    }

    const access_token: string = jwt.sign(
      { object },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '1d' },
    );

    if (!access_token) {
      Logger.error('Access token not generated', { object });
      ThrowError('JWT_ERROR');
    }

    return { access_token };
  } catch (error) {
    return null;
  }
};

export default signJWT;