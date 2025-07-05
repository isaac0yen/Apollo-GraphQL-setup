import dotenv from 'dotenv';
dotenv.config();

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_USER = process.env.DB_USER || ''
export const DB_PASSWORD = process.env.DB_PASSWORD || ''
export const DB_DATABASE = process.env.DB_DATABASE || ''
export const JWT_SECRET = process.env.JWT_SECRET
export const SAFE_HAVEN_API = "https://api.safehavenmfb.com"
export const DEFAULT_ACCOUNT_NUMBER = process.env.DEFAULT_ACCOUNT_NUMBER || '0000000000'
export const SAFE_HAVEN_TOKEN = process.env.SAFE_HAVEN_TOKEN;
export const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;