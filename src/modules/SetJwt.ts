import jwt from 'jsonwebtoken';
import 'dotenv/config';

import Validate from './Validate.js';
import ThrowError from './ThrowError.js';
import Logger from './Logger.js';
import { db } from './Database.js';

interface JWTObject {
  access_token: string;
  refresh_token: string;
}

const setJWT = async (id: number): Promise<JWTObject | null> => {
  try {
    if (!Validate.integer(id)) {
      Logger.error('Invalid ID passed to SetJWT', { id });
      ThrowError('JWT_ERROR');
    }

    const user = await db.findOne('user', { id });

    const userObject = {
      id: user.id
    }

    if (!user) {
      Logger.error('user not found while setting JWT', { id });
      ThrowError('JWT_ERROR');
    }

    const access_token: string = jwt.sign(
      { userObject },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '7d' },
    );

    if (!access_token) {
      Logger.error('Access token not generated', { id });
      ThrowError('JWT_ERROR');
    }

    const refresh_id = `${Math.round(Math.random() * 9999999999)}.${Date.now()}`;

    const refreshObject = {
      id,
      refresh_id,
    };

    const refresh_token: string = await jwt.sign(
      refreshObject,
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '30d' },
    );

    if (!refresh_token) {
      Logger.error('Refresh token not generated', { id });
      ThrowError('JWT_ERROR');
    }

    const updated = await db.updateOne('user', { refresh_id }, { id });

    if (updated < 1) {
      Logger.error('Refresh ID not updated', { id });
      ThrowError('JWT_ERROR');
    }

    return { access_token, refresh_token };
  } catch (error) {
    return null;
  }
};

export default setJWT;