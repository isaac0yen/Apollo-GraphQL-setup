import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import typeDefs from './typeDefs.js';
import resolvers from './resolvers/resolverMain.js';

import { DBConnect } from './modules/Database.js';
import Logger from './modules/Logger.js';
import formatError from './middleware/FormatError.js';
import Auth from './middleware/Auth.js';

Logger.init({
  logDir: 'logs',
  levels: ['info', 'warn', 'error'],
  format: Logger.defaultFormat,
  dateFormat: 'yyyy-LL-dd',
  maxFiles: 30,
});

await DBConnect();

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  introspection: true,
  formatError,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const config = await Auth(req, res);
    return config;
  },
});

console.log(`🚀  Server ready at: ${url}`);
