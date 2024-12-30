import jwt, { JwtPayload } from 'jsonwebtoken';
import ThrowError from '../modules/ThrowError.js';
import { db } from '../modules/Database.js';
import setJWT from '../modules/SetJwt.js';
import Logger from '../modules/Logger.js';

interface VerifiedToken extends JwtPayload {
  userObject?: Record<string, unknown>;
  refresh_id?: string;
}

function verifyAccessToken(token: string): VerifiedToken | null {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, {
      algorithms: ['HS256'],
    }) as VerifiedToken;
  } catch (error) {
    Logger.error('Failed to verify access token', error);
    return null;
  }
}

function verifyRefreshToken(token: string): VerifiedToken | null {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, {
      algorithms: ['HS256'],
    }) as VerifiedToken;
  } catch (error) {
    Logger.error('Failed to verify refresh token', error);
    return null;
  }
}

const Auth = async (req, res): Promise<Record<string, unknown> | null> => {
  try {
    const access_token = req.headers['abc-access'] as string | undefined;
    const refresh_token = req.headers['abc-refresh'] as string | undefined;

    if (!access_token || !refresh_token) {
      return null;
    }

    const accessTokenPayload = verifyAccessToken(access_token);
    if (accessTokenPayload) {
      return accessTokenPayload.userObject ?? null;
    }

    const refreshTokenPayload = verifyRefreshToken(refresh_token);
    if (!refreshTokenPayload || !refreshTokenPayload.refresh_id) {
      ThrowError('RELOGIN');
    }

    const user = await db.findOne('user', {
      refresh_id: refreshTokenPayload.refresh_id,
    });

    if (!user) {
      return null;
    }

    const userTokens = await setJWT(user.id);
    res.set({
      'Access-Control-Expose-Headers': 'abc-access,abc-refresh',
      'abc-access': userTokens.access_token,
      'abc-refresh': userTokens.access_token,
    });

    return user.userObject;
  } catch (err) {
    Logger.error('Authentication process failed', err);
    return null;
  }
};

export default Auth;