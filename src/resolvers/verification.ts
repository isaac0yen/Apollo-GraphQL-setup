import { sendOtpToBvnOrOtp, verifyBvnOrNin } from "../safeHaven/verification.api";
import { createSubAccount } from "../safeHaven/subAccounts";
import ThrowError from "../modules/ThrowError";
import { v4 as uuidv4 } from 'uuid';
import Logger from "../modules/Logger";

export default {
  Mutation: {
    initialUserVerification: async (_: unknown, { number, type }: { number: string; type: string }) => {
      let valueType = null;

      if (type === 'bvn') {
        valueType = 'bvn';
      } else if (type === 'nin') {
        valueType = 'nin';
      }

      if (valueType === null || valueType === undefined) {
        ThrowError('You have to provide a valid type for verification');
      }

      if (number === null || number === undefined || number.length < 11) {
        ThrowError('You have to provide a valid number for verification');
      }

      const verificationSent = await sendOtpToBvnOrOtp(valueType, number)

      console.log('Verification response:', verificationSent);

      if (!verificationSent) {
        ThrowError('Verification failed. Please try again later.');
      }

      if (!verificationSent.statusCode || verificationSent.statusCode !== 200) {
        Logger.error('Verification request failed:', verificationSent);
        ThrowError('Verification request failed. Please try again later.');
      }

      return {
        success: true,
        message: 'Verification request sent successfully, Please check your messages for the OTP that was sent to you.',
        _id: verificationSent.data._id
      };

    },

    verifyUserOtp: async (_: unknown, { _id, type, otp, email_address, number }: { _id: string; type: string; otp: string; email_address: string, number: string }) => {
      let valueType = null;

      if (type === 'bvn') {
        valueType = 'bvn';
      } else if (type === 'nin') {
        valueType = 'nin';
      }

      if (valueType === null || valueType === undefined) {
        ThrowError('You have to provide a valid type for verification');
      }

      if (!_id || !otp) {
        ThrowError('identityId and otp are required');
      }

      try {
        const verificationResult = await verifyBvnOrNin(valueType, _id, otp);

        if (!verificationResult.statusCode || verificationResult.statusCode !== 200) {
          Logger.error('Verification failed:', verificationResult);
          ThrowError('Verification request failed. Please try again later.');
        }

        const user = {
          first_name: verificationResult.data.providerResponse.firstName,
          last_name: verificationResult.data.providerResponse.lastName,
          dob: verificationResult.data.providerResponse.dob,
          phone: verificationResult.data.providerResponse.phone,
          gender: verificationResult.data.providerResponse.gender,
          state_of_origin: verificationResult.data.providerResponse.stateOfOrigin,
          lga_of_origin: verificationResult.data.providerResponse.lgaOfOrigin || null,
        }

        console.log('User data from verification:', user);

        // Create sub account
        const formattedPhone = verificationResult.data.providerResponse.phone.startsWith('0')
          ? '+234' + verificationResult.data.providerResponse.phone.substring(1)
          : verificationResult.data.providerResponse.phone;

        const subAccountData = {
          phoneNumber: formattedPhone,
          emailAddress: email_address,
          identityType: valueType.toUpperCase() as 'BVN' | 'NIN',
          autoSweep: false,
          externalReference: uuidv4(),
          identityNumber: number,
          identityId: _id,
          otp: otp
        };

        const subAccountResult = await createSubAccount(subAccountData);
        console.log('Sub account creation result:', subAccountResult);

        return {
          success: true,
          message: 'OTP verification completed successfully and sub account created',
          data: {
            verification: verificationResult,
            subAccount: subAccountResult,
            user: user
          }
        };
      } catch (error) {
        console.error('Error during OTP verification:', error);
        ThrowError('OTP verification failed. Please check your OTP and try again.');
      }
    },

    createUserSubAccount: async (_: unknown, { 
      phoneNumber, 
      emailAddress, 
      identityType, 
      externalReference, 
      identityNumber, 
      identityId, 
      otp 
    }: { 
      phoneNumber: string; 
      emailAddress: string; 
      identityType: string; 
      externalReference: string; 
      identityNumber: string; 
      identityId: string; 
      otp: string; 
    }) => {
      try {
        // Validate identity type
        if (identityType !== 'BVN' && identityType !== 'NIN') {
          ThrowError('identityType must be either "BVN" or "NIN"');
        }

        // Format phone number to +234 format if needed
        const formattedPhone = phoneNumber.startsWith('0') 
          ? '+234' + phoneNumber.substring(1)
          : phoneNumber;

        const subAccountData = {
          phoneNumber: formattedPhone,
          emailAddress: emailAddress,
          identityType: identityType as 'BVN' | 'NIN',
          externalReference: externalReference,
          identityNumber: identityNumber,
          identityId: identityId,
          otp: otp
        };

        const subAccountResult = await createSubAccount(subAccountData);
        console.log('Sub account creation result:', subAccountResult);

        return {
          success: true,
          message: 'Sub account created successfully',
          data: subAccountResult
        };
      } catch (error) {
        console.error('Sub account creation failed:', error);
        ThrowError('Sub account creation failed. Please try again.');
      }
    }

  }

}