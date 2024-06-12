import jwt, { JwtPayload } from 'jsonwebtoken';
import ThrowError from '../modules/ThrowError.js';
import { db } from '../modules/Database.js';
import setJWT from '../modules/SetJwt.js';
import Logger from '../modules/Logger.js';

interface VerifiedToken extends JwtPayload {
  userObject?: Record<string, unknown>;
  refreshId?: string;
}

function validateAccessToken(token: string): VerifiedToken | null {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, {
      algorithms: ['HS256'],
    }) as VerifiedToken;
  } catch (error) {
    Logger.error('An error occured in Auth line 15', error);
    return null;
  }
}

function validateRefreshToken(token: string): VerifiedToken | null {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, {
      algorithms: ['HS256'],
    }) as VerifiedToken;
  } catch (error) {
    Logger.error('An error occured in Auth line 25', error);
    return null;
  }
}

const Auth = async (req, res): Promise<Record<string, unknown> | null> => {
  try {
    const accessToken = req.headers['abc-access'] as string | undefined;
    const refreshToken = req.headers['abc-refresh'] as string | undefined;

    if (refreshToken && accessToken) {
      const isValidAccessToken = validateAccessToken(accessToken);

      if (isValidAccessToken) {
        return isValidAccessToken.userObject ?? null;
      }

      const isValidRefreshToken = validateRefreshToken(refreshToken);

      if (isValidRefreshToken && isValidRefreshToken.refreshId) {
        const user = await db.findOne('user', {
          refreshId: isValidRefreshToken.refreshId,
        });

        if (user) {
          const userTokens = await setJWT(user.id);

          res.set({
            'Access-Control-Expose-Headers': 'abc-access,abc-refresh',
            'abc-access': userTokens.accessToken,
            'abc-refresh': userTokens.refreshToken,
          });

          return user.userObject;
        } else {
          return null;
        }
      } else {
        ThrowError('RELOGIN');
      }
    } else {
      return null;
    }
  } catch (err) {
    Logger.error('An error occured in Auth line 74 for user with id:', err);
    return null;
  }
};

export default Auth;
