import bcrypt from 'bcrypt';

import { db } from '../modules/Database.js';
import ThrowError from '../modules/ThrowError.js';
import Validate from '../modules/Validate.js';
import { UserInput } from '../types/user';

export default {
  Mutation: {
    createUser: async (_, { input }: { input: UserInput }) => {
      if (!Validate.email(input.email)) {
        ThrowError('Your email is invalid.');
      }
      if (!Validate.object(input.phone)) {
        ThrowError('Your phone is invalid.');
      }

      const userExists = await db.findOne('user', { email: input.email });

      if (userExists) {
        ThrowError('User with this email already exists.');
      }

      const phoneNumber = `+${input.phone.prefix}${parseInt(input.phone.number)}`;

      const password = input.password;

      const hash = await bcrypt.hash(password, 10);

      const user = {
        ...input,
        password: hash,
        phone: phoneNumber,
        status: 'ACTIVE',
      };

      const userCreated = await db.insertOne('user', user);

      if (userCreated < 1) {
        ThrowError(
          'An error occurred while creating your account, please try again later.',
        );
      }

      return true;
    },

    updateUser: async (
      _,
      { userId, input }: { userId: number; input: UserInput },
    ) => {
      const userExists = await db.findOne('user', { id: userId });

      if (!userExists) {
        ThrowError('User not found.');
      }

      let phone;

      if (input.phone) {
        phone = `+${input.phone.prefix}${parseInt(input.phone.number)}`;
      }

      const updatedData = {
        ...input,
        phone,
      };

      const userUpdated = await db.updateOne('user', updatedData, {
        id: userId,
      });

      if (userUpdated < 1) {
        ThrowError(
          'An error occurred while updating your account, please try again later.',
        );
      }

      return true;
    },

    deleteUser: async (_, { userId }: { userId: number }) => {
      const userExists = await db.findOne('user', { id: userId });

      if (!userExists) {
        ThrowError('User not found.');
      }

      const userDeleted = await db.deleteOne('user', { id: userId });

      if (userDeleted < 1) {
        ThrowError(
          'An error occurred while deleting the user, please try again later.',
        );
      }

      return true;
    },
    updatePassword: async (
      _,
      {
        userId,
        oldPassword,
        newPassword,
      }: { userId: number; oldPassword: string; newPassword: string },
    ) => {
      const user = await db.findOne('user', { id: userId });

      if (!user) {
        ThrowError('User not found.');
      }

      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) {
        ThrowError('Old password is incorrect.');
      }

      const hash = await bcrypt.hash(newPassword, 10);

      const userUpdated = await db.updateOne(
        'user',
        { password: hash },
        { id: userId },
      );

      if (userUpdated < 1) {
        ThrowError(
          'An error occurred while updating the password, please try again later.',
        );
      }

      return true;
    },
  },

  Query: {
    getUser: async (_, { userId }: { userId: number }) => {
      const user = await db.findOne('user', { id: userId });

      if (!user) {
        ThrowError('User not found.');
      }

      return user;
    },

    getUsers: async () => {
      const users = await db.findMany('user');

      if (!users) {
        ThrowError('No users found.');
      }

      return users;
    },
  },
};
