import { GraphQLFormattedError } from 'graphql';
import Logger from '../modules/Logger.js';

const formatError = (error: GraphQLFormattedError): GraphQLFormattedError => {
  const message = error.message
    .replace(/Error: /g, '')
    .replace(/GraphQL error: /g, '');

  if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
    Logger.error('UNCAUGHT_INTERNAL_SERVER_ERROR', error);
    return {
      message: "Oops!, that's on us. Please try again later.",
    };
  }

  return {
    ...error,
    message,
  };
};

export default formatError;
