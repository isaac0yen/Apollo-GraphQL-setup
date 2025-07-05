import jwt, { JwtPayload } from 'jsonwebtoken';
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

const Auth = async (req): Promise<Record<string, unknown> | null> => {
  try {
    let access_token = req.headers['authorization'] as string | undefined;

    if (!access_token) {
      return null;
    }

    if (access_token.startsWith('Bearer ')) {
      access_token = access_token.slice(7);
    }

    const accessTokenPayload = verifyAccessToken(access_token);

    return accessTokenPayload ?? null;
  } catch (err) {
    Logger.error('Authentication process failed', err);
    return null;
  }
};
export default Auth;