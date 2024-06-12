const typeDefs = `#graphql
  scalar JSON

  type User {
    id: Int!
    email: String!
    firstname: String!
    lastname: String!
    username: String!
    phone: String!
    country: String!
    state: String!
    role: UserRole!
    status: UserStatus!
    gender: Gender!
    fcm_token: String
    access_token: String
    refresh_token: String
    created_at: String!
    location: String
    star_rating: String
  }

  enum UserRole {
    ADMIN
    USER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
  }

  enum Gender {
    MALE
    FEMALE
  }


  type Query {
    getUser(userId: Int!): User
    getUsers: [User]
  }

  type Mutation {
    # CRUD for User
    createUser(input: UserInput): Boolean
    updateUser(userId: Int!, input: UserInput): Boolean
    deleteUser(userId: Int!): Boolean
    updatePassword(userId: Int!, oldPassword: String!, newPassword: String!): Boolean
  }

  input UserInput {
    email: String!
    firstname: String!
    lastname: String!
    username: String!
    password: String!
    phone: PhoneNumberInput!
    country: String!
    state: String!
    role: UserRole!
    gender: Gender!
  }

  input PhoneNumberInput {
    prefix: String!
    number: String!
  }

`;

export default typeDefs;
