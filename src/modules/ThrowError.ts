import { GraphQLError } from 'graphql';

const ThrowError = (message: string, code: string = ''): never => {
  throw new GraphQLError(message, {
    extensions: { code: code.length > 0 ? code : 'USER' },
  });
};

export default ThrowError;
