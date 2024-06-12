import jwt from 'jsonwebtoken';
import 'dotenv/config';

import Validate from './Validate.js';
import ThrowError from './ThrowError.js';
import Logger from './Logger.js';
import { db } from './Database.js';

interface JWTObject {
  accessToken: string;
  refreshToken: string;
}

const setJWT = async (id: number): Promise<JWTObject | null> => {
  try {
    if (!Validate.integer(id)) {
      Logger.error('Invalid ID passed to SetJWT', { id });
      ThrowError('JWT_ERROR');
    }

    const userObject = await db.findOne('user', { id });

    if (!userObject) {
      Logger.error('user not found while setting JWT', { id });
      ThrowError('JWT_ERROR');
    }

    const accessToken: string = jwt.sign(
      { userObject },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '7d' },
    );

    if (!accessToken) {
      Logger.error('Access token not generated', { id });
      ThrowError('JWT_ERROR');
    }

    const refreshId = Math.round(Math.random() * 9999999999) + '.' + Date.now();

    const refreshObject = {
      id,
      refreshId,
    };

    const refreshToken: string = await jwt.sign(
      refreshObject,
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '30d' },
    );

    if (!refreshToken) {
      Logger.error('Refresh token not generated', { id });
      ThrowError('JWT_ERROR');
    }

    const updated = await db.updateOne('user', { refreshId }, { id });

    if (updated < 1) {
      Logger.error('Refresh ID not updated', { id });
      ThrowError('JWT_ERROR');
    }

    return { accessToken, refreshToken };
  } catch (error) {
    return null;
  }
};

export default setJWT;
