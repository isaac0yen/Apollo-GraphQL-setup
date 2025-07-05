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
    canDebit: boolean;
    canCredit: boolean;
    _id: string;
    client: string;
    accountProduct: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    currencyCode: string;
    bvn: string;
    identityId: string;
    accountBalance: number;
    bookBalance: number;
    interestBalance: number;
    withHoldingTaxBalance: number;
    status: string;
    isDefault: boolean;
    nominalAnnualInterestRate: number;
    interestCompoundingPeriod: string;
    interestPostingPeriod: string;
    interestCalculationType: string;
    interestCalculationDaysInYearType: string;
    minRequiredOpeningBalance: number;
    lockinPeriodFrequency: number;
    lockinPeriodFrequencyType: string;
    allowOverdraft: boolean;
    overdraftLimit: number;
    chargeWithHoldingTax: boolean;
    chargeValueAddedTax: boolean;
    chargeStampDuty: boolean;
    notificationSettings: {
      smsNotification: boolean;
      emailNotification: boolean;
      emailMonthlyStatement: boolean;
      smsMonthlyStatement: boolean;
    };
    isSubAccount: boolean;
    subAccountDetails: {
      firstName: string;
      lastName: string;
      emailAddress: string;
      bvn: string;
      nin: string;
      accountType: string;
    };
    externalReference: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    cbaAccountId: string;
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
