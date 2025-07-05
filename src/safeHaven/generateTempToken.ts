import axios from 'axios';
import { CLIENT_ID, SAFE_HAVEN_API, SAFE_HAVEN_TOKEN } from '../settings/config';

export interface TokenResponse {
  access_token: string;
  client_id: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  ibs_client_id: string;
  ibs_user_id: string;
}

const OAUTH_URL = `${SAFE_HAVEN_API}/oauth2/token`;

export const generateTempToken = async (): Promise<TokenResponse> => {
  try {
    const response = await axios.post(OAUTH_URL, {
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_id: CLIENT_ID,
      client_assertion: SAFE_HAVEN_TOKEN
    }, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to generate temp token:', error);
    throw new Error('Token generation failed');
  }
};
