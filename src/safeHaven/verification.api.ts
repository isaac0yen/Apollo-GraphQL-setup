import axios from "axios";
import { DEFAULT_ACCOUNT_NUMBER, SAFE_HAVEN_API } from "../settings/config";
import Logger from "../modules/Logger";
import { generateTempToken } from "./generateTempToken";

export interface OtpResponse {
  statusCode: number;
  data: {
    clientId: string;
    type: string;
    amount: number;
    status: string;
    debitAccountNumber: string;
    vat: number;
    stampDuty: number;
    isDeleted: boolean;
    otpVerified: boolean;
    otpResendCount: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface VerifyResponse {
  statusCode: number;
  data: {
    _id: string;
    clientId: string;
    type: string;
    amount: number;
    status: string;
    debitAccountNumber: string;
    vat: number;
    stampDuty: number;
    isDeleted: boolean;
    otpVerified: boolean;
    otpResendCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    debitMessage: string;
    debitResponsCode: number;
    debitSessionId: string;
    providerResponse: {
      firstName: string;
      lastName: string;
      dob: string;
      phone: string;
      gender: string;
      stateOfOrigin: string;
      lgaOfOrigin: string | null;
      photo: string;
      otpId: string;
    };
  };
}

export const sendOtpToBvnOrOtp = async (isBvnOrNin: 'bvn' | 'nin', number: string): Promise<OtpResponse> => {

  if (isBvnOrNin !== 'bvn' && isBvnOrNin !== 'nin') {
    throw new Error('isBvnOrNin must be either "bvn" or "nin"');
  }

  if (!/^\d{11}$/.test(number)) {
    throw new Error('Number must be exactly 11 digits');
  }

  try {

    const { access_token, ibs_client_id } = await generateTempToken();

    const response = await axios.post(`${SAFE_HAVEN_API}/identity/v2`, {
      type: isBvnOrNin.toUpperCase(),
      async: true,
      number: number,
      debitAccountNumber: DEFAULT_ACCOUNT_NUMBER
    }, {
      headers: {
        'ClientID': ibs_client_id,
        'accept': 'application/json',
        'authorization': `Bearer ${access_token}`,
        'content-type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    Logger.error('BVN/NIN verification failed:', error);
    throw error;
  }
}
export const verifyBvnOrNin = async (isBvnOrNin: 'bvn' | 'nin', identityId: string, otp: string): Promise<VerifyResponse> => {
  if (isBvnOrNin !== 'bvn' && isBvnOrNin !== 'nin') {
    throw new Error('isBvnOrNin must be either "bvn" or "nin"');
  }

  if (!identityId || !otp) {
    throw new Error('identityId and otp are required');
  }

  try {

    const { access_token, ibs_client_id } = await generateTempToken();

    const response = await axios.post(`${SAFE_HAVEN_API}/identity/v2/validate`, {
      type: isBvnOrNin.toUpperCase(),
      identityId: identityId,
      otp: otp
    }, {
      headers: {
        'ClientID': ibs_client_id,
        'accept': 'application/json',
        'authorization': `Bearer ${access_token}`,
        'content-type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    Logger.error('BVN/NIN verification failed:', error);
    throw error;
  }
}