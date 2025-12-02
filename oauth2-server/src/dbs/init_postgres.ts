import { Sequelize } from 'sequelize';
import config from '../config/config.app';

const { dbHost, dbPort, dbUser, dbPassword, dbDatabase } = config.app;

const sequelize = new Sequelize(
  dbDatabase || 'demo_oauth',
  dbUser || 'postgres',
  dbPassword || '',
  {
    host: dbHost || 'localhost',
    port: parseInt(dbPort || '5432'),
    dialect: 'postgres',
    logging: false,
    define: {
      freezeTableName: true,
    },
  }
);

async function connect(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection established');
  } catch (error: any) {
    console.error('Unable to connect to PostgreSQL:', error.message);
  }
}

connect();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await sequelize.close();
  process.exit(0);
});

export default sequelize;
