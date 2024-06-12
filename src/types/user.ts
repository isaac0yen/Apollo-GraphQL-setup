interface UserRole {
  ADMIN: UserRole;
  USER: UserRole;
}

interface UserStatus {
  ACTIVE: UserStatus;
  INACTIVE: UserStatus;
}

interface Gender {
  MALE: Gender;
  FEMALE: Gender;
}

interface PhoneNumber {
  prefix: string;
  number: string;
}

export interface UserInput {
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  phone: PhoneNumber;
  country: string;
  state: string;
  role: UserRole;
  gender: Gender;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  phone: string;
  country: string;
  state: string;
  role: UserRole;
  status: UserStatus;
  gender: Gender;
  fcm_token?: string;
  access_token?: string;
  refresh_token?: string;
  created_at: string;
  location?: string;
  star_rating?: string;
}
