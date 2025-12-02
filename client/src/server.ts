import express, { Application } from 'express';
import session from 'express-session';
import path from 'path';
import config from './config';
import indexRoutes from './routes/index';
import apiRoutes from './routes/api';
import './types'; // Import types for session extension

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'demo-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/', indexRoutes);
app.use('/', apiRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`\n========================================`);
  console.log(`  OAuth2 Demo Client`);
  console.log(`========================================`);
  console.log(`  Server running at: http://localhost:${config.port}`);
  console.log(`  Client ID: ${config.clientId}`);
  console.log(`  Callback URL: ${config.callbackUrl}`);
  console.log(`  OAuth Server: ${config.oauthServerUrl}`);
  console.log(`========================================\n`);
});

export default app;
