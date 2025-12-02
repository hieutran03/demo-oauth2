import { AppConfig } from '../types';

const env = process.env.NODE_ENV || 'dev';

const generalConfig = {
  environment: env,
  apptoken: {
    timeout: process.env.TOKEN_TIMEOUT,
    timeout_cache: process.env.TOKEN_TIMEOUT_REDIS,
  },
};

const dev: AppConfig = {
  ...generalConfig,
  app: {
    appkey: process.env.DEV_APP_KEY,
    port: process.env.DEV_PORT || 3000,
    dbHost: process.env.DEV_DB_HOST,
    dbPort: process.env.DEV_DB_PORT,
    dbUser: process.env.DEV_DB_USER,
    dbPassword: process.env.DEV_DB_PASSWORD,
    dbDatabase: process.env.DEV_DB_DATABASE,
  },
};

const configs: Record<string, AppConfig> = { dev };

console.log(`Initializing Config App at ${env} environment`);

export default configs[env];
export const logoutAllUserKey = 'logout_all_users';
