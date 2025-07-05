import user from './user.js';
import verification from './verification.js';

const resolver = {
  Mutation: {
    ...user.Mutation,
    ...verification.Mutation
  },
  Query: {
    ...user.Query,
  },
};

export default resolver;
