const typeDefs = `#graphql
# Scalar types
scalar DateTime
scalar Date
scalar JSON

# Enums
enum UserRole {
  STUDENT
  BUSINESS
  INVESTOR
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  COMPLETED
  CANCELLED
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
  MARKETPLACE_PAYMENT
  BILL_PAYMENT
  SUBSCRIPTION_FEE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum BillStatus {
  PENDING
  PAID
  OVERDUE
}

enum LoanApplicationStatus {
  APPLIED
  APPROVED
  DISBURSED
  REJECTED
  CLOSED
}

enum LoanStatus {
  ACTIVE
  PAID_OFF
  DEFAULTED
}

enum SubscriptionType {
  PHYSICAL
  DIGITAL
  EDUCATION
  LIFESTYLE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
}

enum PaymentLinkType {
  ONE_TIME
  SUBSCRIPTION
}

# Object Types
type User {
  id: ID!
  email: String!
  fullName: String!
  role: UserRole!
  phoneNumber: String
  kycVerified: Boolean!
  institution: String
  createdAt: DateTime!
  updatedAt: DateTime!
  businessProfile: BusinessProfile
  orders: [Order!]!
  transactions: [Transaction!]!
  p2pSent: [P2PTransfer!]!
  p2pReceived: [P2PTransfer!]!
  bills: [Bill!]!
  investments: [LoanInvestor!]!
  subscriptionCustomers: [SubscriptionCustomer!]!
}

type BusinessProfile {
  user: User!
  businessName: String!
  description: String
  verified: Boolean!
  subscriptionPlan: String!
  products: [Product!]!
  loanApplications: [LoanApplication!]!
  subscriptions: [Subscription!]!
  paymentLinks: [PaymentLink!]!
}

type Product {
  id: ID!
  business: BusinessProfile!
  name: String!
  description: String
  price: Float!
  currency: String!
  stockQuantity: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Order {
  id: ID!
  buyer: User!
  totalAmount: Float!
  currency: String!
  status: OrderStatus!
  createdAt: DateTime!
  items: [OrderItem!]!
}

type OrderItem {
  id: ID!
  order: Order!
  product: Product!
  quantity: Int!
  unitPrice: Float!
}

type Transaction {
  id: ID!
  user: User!
  type: TransactionType!
  amount: Float!
  currency: String!
  reference: String
  status: TransactionStatus!
  createdAt: DateTime!
  p2pTransfer: P2PTransfer
}

type P2PTransfer {
  id: ID!
  transaction: Transaction!
  from: User!
  to: User!
}

type Bill {
  id: ID!
  user: User!
  billType: String!
  amount: Float!
  dueDate: Date!
  status: BillStatus!
  createdAt: DateTime!
}

type LoanApplication {
  id: ID!
  business: BusinessProfile!
  amountRequested: Float!
  termMonths: Int!
  interestRate: Float!
  riskScore: Float!
  status: LoanApplicationStatus!
  appliedAt: DateTime!
  loan: Loan
}

type Loan {
  id: ID!
  application: LoanApplication!
  disbursedAmount: Float!
  disbursedAt: DateTime!
  dueDate: Date!
  status: LoanStatus!
  repayments: [LoanRepayment!]!
  investors: [LoanInvestor!]!
}

type LoanRepayment {
  id: ID!
  loan: Loan!
  amount: Float!
  repaymentDate: Date!
  createdAt: DateTime!
}

type LoanInvestor {
  id: ID!
  loan: Loan!
  investor: User!
  amountInvested: Float!
  investedAt: DateTime!
}

type Subscription {
  id: ID!
  business: BusinessProfile!
  name: String!
  type: SubscriptionType!
  price: Float!
  intervalMonths: Int!
  createdAt: DateTime!
  customers: [SubscriptionCustomer!]!
}

type SubscriptionCustomer {
  id: ID!
  subscription: Subscription!
  user: User!
  startDate: Date!
  nextBillingDate: Date!
  status: SubscriptionStatus!
}

type PaymentLink {
  id: ID!
  business: BusinessProfile!
  linkToken: String!
  type: PaymentLinkType!
  amount: Float!
  expiresAt: DateTime
  usageLimit: Int!
  usedCount: Int!
  createdAt: DateTime!
}

# Input Types
input AuthInput {
  email: String!
  password: String!
}

input NewUserInput {
  email: String!
  password: String!
  fullName: String!
  role: UserRole = STUDENT
  phoneNumber: String
  institution: String
}

input NewBusinessProfileInput {
  userId: ID!
  businessName: String!
  description: String
}

input NewProductInput {
  businessId: ID!
  name: String!
  description: String
  price: Float!
  currency: String = "NGN"
  stockQuantity: Int = 0
}

input UpdateProductInput {
  id: ID!
  name: String
  description: String
  price: Float
  stockQuantity: Int
}

input NewOrderInput {
  buyerId: ID!
}

input NewOrderItemInput {
  orderId: ID!
  productId: ID!
  quantity: Int!
}

input NewTransactionInput {
  userId: ID!
  type: TransactionType!
  amount: Float!
  currency: String = "NGN"
  reference: String
}

input NewP2PTransferInput {
  transactionId: ID!
  fromUserId: ID!
  toUserId: ID!
}

input NewBillInput {
  userId: ID!
  billType: String!
  amount: Float!
  dueDate: Date!
}

input NewLoanApplicationInput {
  businessId: ID!
  amountRequested: Float!
  termMonths: Int!
  interestRate: Float!
}

input ApproveLoanInput {
  applicationId: ID!
}

input DisburseLoanInput {
  applicationId: ID!
  disbursedAmount: Float!
  dueDate: Date!
}

input NewLoanRepaymentInput {
  loanId: ID!
  amount: Float!
  repaymentDate: Date!
}

input NewLoanInvestmentInput {
  loanId: ID!
  investorId: ID!
  amountInvested: Float!
}

input NewSubscriptionInput {
  businessId: ID!
  name: String!
  type: SubscriptionType!
  price: Float!
  intervalMonths: Int!
}

input NewSubscriptionCustomerInput {
  subscriptionId: ID!
  userId: ID!
  startDate: Date!
  nextBillingDate: Date!
}

input NewPaymentLinkInput {
  businessId: ID!
  type: PaymentLinkType!
  amount: Float!
  expiresAt: DateTime
  usageLimit: Int = 1
}

# Queries
type Query {
  user(id: ID!): User
  users(role: UserRole): [User!]!
  me: User

  businessProfile(userId: ID!): BusinessProfile
  products(businessId: ID): [Product!]!
  product(id: ID!): Product
  orders(buyerId: ID): [Order!]!
  order(id: ID!): Order

  transactions(userId: ID!): [Transaction!]!
  p2pTransfers(userId: ID!): [P2PTransfer!]!

  bills(userId: ID!): [Bill!]!

  loanApplications(businessId: ID): [LoanApplication!]!
  loans(businessId: ID, investorId: ID): [Loan!]!
  loan(id: ID!): Loan

  subscriptions(businessId: ID): [Subscription!]!
  subscriptionCustomers(userId: ID): [SubscriptionCustomer!]!

  paymentLinks(businessId: ID!): [PaymentLink!]!
}

# Mutations
type Mutation {

  initialUserVerification(number: String! type: String!): JSON!
  verifyUserOtp(_id: String! type: String! otp: String! email_address:String number:String): JSON!
  createUserSubAccount(
    phoneNumber: String!
    emailAddress: String!
    identityType: String!
    externalReference: String!
    identityNumber: String!
    identityId: String!
    otp: String!
  ): JSON!
  

  register(input: NewUserInput!): User!
  login(input: AuthInput!): String!   # returns JWT

  verifyKYC(userId: ID!): User!

  createBusinessProfile(input: NewBusinessProfileInput!): BusinessProfile!
  createProduct(input: NewProductInput!): Product!
  updateProduct(input: UpdateProductInput!): Product!
  createOrder(input: NewOrderInput!): Order!
  addOrderItem(input: NewOrderItemInput!): OrderItem!

  createTransaction(input: NewTransactionInput!): Transaction!
  createP2PTransfer(input: NewP2PTransferInput!): P2PTransfer!

  createBill(input: NewBillInput!): Bill!
  payBill(billId: ID!): Bill!

  applyForLoan(input: NewLoanApplicationInput!): LoanApplication!
  approveLoan(input: ApproveLoanInput!): LoanApplication!
  disburseLoan(input: DisburseLoanInput!): Loan!
  repayLoan(input: NewLoanRepaymentInput!): LoanRepayment!

  investInLoan(input: NewLoanInvestmentInput!): LoanInvestor!

  createSubscription(input: NewSubscriptionInput!): Subscription!
  subscribe(input: NewSubscriptionCustomerInput!): SubscriptionCustomer!
  cancelSubscription(customerId: ID!): SubscriptionCustomer!

  createPaymentLink(input: NewPaymentLinkInput!): PaymentLink!
  usePaymentLink(linkToken: String!): PaymentLink!
}

`;

export default typeDefs;
