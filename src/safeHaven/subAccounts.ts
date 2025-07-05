import axios from 'axios';
import { SAFE_HAVEN_API } from '../settings/config';
import { generateTempToken } from './generateTempToken';
import Logger from '../modules/Logger';

export interface CreateSubAccountRequest {
  phoneNumber: string;
  emailAddress: string;
  identityType: 'BVN' | 'NIN';
  externalReference: string;
  identityNumber: string;
  identityId: string;
  otp: string;
}

export interface CreateSubAccountResponse {
  statusCode: number;
  data: {
    _id: string;
    accountNumber: string;
    accountName: string;
    phoneNumber: string;
    emailAddress: string;
    identityType: string;
    externalReference: string;
    identityNumber: string;
    identityId: string;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const createSubAccount = async (accountData: CreateSubAccountRequest): Promise<CreateSubAccountResponse> => {
  try {
    const { access_token, ibs_client_id } = await generateTempToken();
    
    const response = await axios.post(`${SAFE_HAVEN_API}/accounts/v2/subaccount`, accountData, {
      headers: {
        'ClientID': ibs_client_id,
        'accept': 'application/json',
        'authorization': `Bearer ${access_token}`,
        'content-type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    Logger.error('Sub account creation failed:', error);
    throw error;
  }
};
