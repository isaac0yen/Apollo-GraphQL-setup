-- Enable strict mode and InnoDB for foreign key support
SET
  sql_mode = 'STRICT_ALL_TABLES';

SET
  default_storage_engine = InnoDB;

SET
  NAMES utf8mb4;

-- 1. Users (students, businesses, investors)
CREATE TABLE
  users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255),
    dob VARCHAR(20),
    phone VARCHAR(20),
    gender ENUM('MALE', 'FEMALE') NULL,
    state_of_origin VARCHAR(255),
    lga_of_origin VARCHAR(255),
    account_number VARCHAR(20) UNIQUE,
    role ENUM ('STUDENT', 'BUSINESS', 'INVESTOR', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    phone_number VARCHAR(20),
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    institution VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE = InnoDB;

-- 2. Business profiles (for sellers / student businesses)
CREATE TABLE
  business_profiles (
    user_id BIGINT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_plan ENUM ('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 3. Products / Services
CREATE TABLE
  products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_profiles (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 4. Orders & Order Items
CREATE TABLE
  orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    status ENUM (
      'PENDING',
      'PAID',
      'SHIPPED',
      'COMPLETED',
      'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

CREATE TABLE
  order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 5. Transactions (banking, marketplace, P2P transfers, bills, subscriptions)
CREATE TABLE
  transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM (
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER',
      'MARKETPLACE_PAYMENT',
      'BILL_PAYMENT',
      'SUBSCRIPTION_FEE'
    ) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    reference VARCHAR(255) UNIQUE,
    status ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 6. Peer-to-Peer Transfers detail
CREATE TABLE
  p2p_transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL UNIQUE,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 7. Bills / Airtime purchases
CREATE TABLE
  bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bill_type VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM ('PENDING', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 8. Loan Applications (embedded lending)
CREATE TABLE
  loan_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    amount_requested DECIMAL(12, 2) NOT NULL,
    term_months INT NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- monthly %
    risk_score DECIMAL(5, 2) NOT NULL,
    status ENUM (
      'APPLIED',
      'APPROVED',
      'DISBURSED',
      'REJECTED',
      'CLOSED'
    ) NOT NULL DEFAULT 'APPLIED',
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_profiles (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 9. Loans & Repayments
CREATE TABLE
  loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    disbursed_amount DECIMAL(12, 2) NOT NULL,
    disbursed_at DATETIME NOT NULL,
    due_date DATE NOT NULL,
    status ENUM ('ACTIVE', 'PAID_OFF', 'DEFAULTED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (application_id) REFERENCES loan_applications (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

CREATE TABLE
  loan_repayments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    repayment_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 10. Peer-to-Peer Lending (investor contributions)
CREATE TABLE
  loan_investors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    investor_id BIGINT NOT NULL,
    amount_invested DECIMAL(12, 2) NOT NULL,
    invested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 11. Subscriptions (business offers)
CREATE TABLE
  subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM ('PHYSICAL', 'DIGITAL', 'EDUCATION', 'LIFESTYLE') NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    interval_months INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_profiles (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 12. Subscription Customers
CREATE TABLE
  subscription_customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    status ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 13. One-Time Payment Links
CREATE TABLE
  payment_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    link_token CHAR(36) NOT NULL UNIQUE,
    type ENUM ('ONE_TIME', 'SUBSCRIPTION') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expires_at DATETIME,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_profiles (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB;