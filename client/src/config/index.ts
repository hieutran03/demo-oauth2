import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

export const config: AppConfig = {
  clientId: process.env.CLIENT_ID || 'demo-client',
  clientSecret: process.env.CLIENT_SECRET || 'demo-client-secret',
  callbackUrl: process.env.CALLBACK_URL || 'http://localhost:4000/callback',
  oauthServerUrl: process.env.OAUTH_SERVER_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '4000', 10),
};

export default config;
