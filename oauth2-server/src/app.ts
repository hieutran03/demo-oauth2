import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import { applicationLogger } from './loggers/mylogger.log';
import ErrorMessage from './enum/error.message';
import { NotFoundError } from './core/error.response';
import swaggerSpec from './swagger/swagger';
import router from './routers';

const app: Application = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
  })
);

// Security & Compression
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('combined'));
app.use(compression());

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string;
  req.requestId = requestId || uuidv4();
  req.requestDateNow = Date.now();

  applicationLogger.log(`input param::: ${req.method}`, [
    req.path,
    { requestId: req.requestId },
    { query: req.query, body: req.body },
  ]);

  next();
});

// Routes
app.use('/', router);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(ErrorMessage.PAGE_NOT_FOUND));
});

// Error Handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.status || 500;
  const errorMessage = statusCode === 500 ? ErrorMessage.SOMETHING_WENT_WRONG : error.message;

  const resMessage = `${statusCode} - ${Date.now() - (req.requestDateNow || 0)}ms - Response: ${JSON.stringify(error)}`;
  
  applicationLogger.error(resMessage, [
    req.path,
    { requestId: req.requestId },
    { message: error.message, body: req.body },
  ]);

  if (statusCode === 500) {
    console.error(error.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

export default app;
