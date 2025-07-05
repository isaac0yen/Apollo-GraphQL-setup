import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import typeDefs from './typeDefs.js';
import resolvers from './resolvers/index.js';

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

DBConnect().then(() => {
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    introspection: true,
    formatError,
  });

  startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      return await Auth(req);
    },
  }).then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  }).catch(error => {
    console.error('Failed to start server:', error);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1)
});