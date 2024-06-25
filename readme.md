# Project README.md

## Overview

This project is a Node.js application that utilizes GraphQL for API interactions, ensuring a clean and efficient architecture. The structure is designed to minimize redundant code, enhance error handling, and provide a robust logging mechanism. TypeScript is used to ensure type safety, and the project is linted and formatted to maintain code quality.

## Directory Structure

```
.
├── eslint.config.js
├── package.json
├── package-lock.json
├── readme.md
├── src
│   ├── index.ts
│   ├── middleware
│   │   ├── Auth.ts
│   │   └── FormatError.ts
│   ├── modules
│   │   ├── Database.ts
│   │   ├── Logger.ts
│   │   ├── SetJwt.ts
│   │   ├── ThrowError.ts
│   │   └── Validate.ts
│   ├── resolvers
│   │   ├── resolverMain.ts
│   │   └── user.ts
│   ├── typeDefs.ts
│   └── types
│       └── user.ts
└── tsconfig.json
```

## Key Components

### Type Definitions (`typeDefs.ts`)

The GraphQL schema is defined here.

### Resolvers (`resolvers/user.ts`)

The resolvers handle the actual logic for GraphQL queries and mutations. Each resolver function is designed to handle specific operations such as creating, updating, deleting users, and updating passwords.

### Modules

## Database (`modules/Database.ts`)
This module handles all database interactions, providing methods for finding, inserting, updating, and deleting records. It is a derived work originally written by Engineer Leke Ojikutu ([GitHub](https://github.com/lojik-ng)) in JavaScript, and strongly typed by me, Oyeniyi Isaac ([GitHub](https://github.com/isaac0yen)).

## Logger (`modules/Logger.ts`)
This module provides a logging mechanism, allowing the application to log messages of various severity levels (info, warn, error). It is self-written by Oyeniyi Isaac ([GitHub](https://github.com/isaac0yen)).

## ThrowError (`modules/ThrowError.ts`)
A utility module to throw formatted errors consistently across the application. Written by Engineer Leke Ojikutu ([GitHub](https://github.com/lojik-ng)).

## Validate (`modules/Validate.ts`)
Contains validation functions for various input types, ensuring data integrity before database operations. Written by Engineer Leke Ojikutu ([GitHub](https://github.com/lojik-ng)).

## Auth (`middleware/Auth.ts`)
Middleware for handling authentication. Written by Engineer Leke Ojikutu ([GitHub](https://github.com/lojik-ng)).

## FormatError (`middleware/FormatError.ts`)
Middleware to format GraphQL errors before sending them to the client. It is self-written by Oyeniyi Isaac ([GitHub](https://github.com/isaac0yen)).


### Index File (`index.ts`)

This is the entry point of the application. It sets up the ApolloServer with the type definitions and resolvers, applies the middleware, and starts the server.

## Error Handling

The architecture minimizes the use of multiple try-catch blocks by handling errors in a centralized manner using utility functions and middlewares. For example, the `ThrowError` module standardizes error throwing, and the `FormatError` middleware ensures that all errors are formatted uniformly.

## Logger

The Logger module initializes logging with specific configurations:
- Log directory: `logs`
- Log levels: `info`, `warn`, `error`
- Log format: Default format provided by the Logger
- Date format: `yyyy-LL-dd`
- Maximum log files: 30

The Logger module is used across the application to log significant events and errors.

## Type Safety

TypeScript is used extensively to ensure type safety. All input types, return types, and internal data structures are strictly typed, minimizing the risk of runtime errors. The project aims for `zero` usage of the `any` type, enforcing strict type checking.

## Linting and Formatting

The project uses ESLint for linting and Prettier for formatting. The configurations ensure that the code adheres to consistent style guidelines, improving readability and maintainability.

### Scripts

- **compile**: Compiles TypeScript files.
- **start**: Compiles TypeScript files and starts the server.
- **format**: Formats code using Prettier.
- **lint**: Lints code using ESLint and fixes issues.

## Getting Started

1. **Install Dependencies**: Run `npm install` to install the required dependencies.
2. **Start the Server**: Run `npm start` to compile the TypeScript files and start the server.
3. **Linting and Formatting**: Use `npm run lint` and `npm run format` to ensure code quality.

## Conclusion

This project is structured to provide a clean, efficient, and maintainable codebase. The use of TypeScript ensures type safety, while centralized error handling and logging mechanisms enhance robustness. The linting and formatting tools help maintain code quality, making the development process smoother and more reliable.
