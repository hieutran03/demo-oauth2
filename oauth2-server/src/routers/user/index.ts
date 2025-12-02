import { Router } from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import userController from '../../controllers/user.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - fullName
 *               - username
 *               - password
 *               - confirmPassword
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', asyncHandler(userController.register));

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: User login (OAuth2 flow)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               client_id:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               state:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       302:
 *         description: Redirect to OAuth2 authorize endpoint
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', asyncHandler(userController.oauthLogin));

export default router;
