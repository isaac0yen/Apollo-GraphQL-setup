import user from './user.js';

const resolver = {
  Mutation: {
    ...user.Mutation,
  },
  Query: {
    ...user.Query,
  },
};

export default resolver;
