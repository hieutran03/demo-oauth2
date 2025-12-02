import { Router, Request, Response } from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import OAuth2Controller from '../../controllers/oauth2.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/oauth/authorize:
 *   get:
 *     summary: OAuth2 authorization endpoint
 *     tags: [OAuth2]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: response_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code]
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to client redirect_uri with authorization code
 */
router.get('/authorize', asyncHandler(OAuth2Controller.authorize));

/**
 * @swagger
 * /api/v1/oauth/token:
 *   post:
 *     summary: Token endpoint
 *     tags: [OAuth2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               grant_type:
 *                 type: string
 *               code:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *     responses:
 *       200:
 *         description: Token response
 */
router.post('/token', asyncHandler(OAuth2Controller.token));

/**
 * @swagger
 * /api/v1/oauth/authenticate:
 *   get:
 *     summary: Check access token
 *     tags: [OAuth2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 */
router.get('/authenticate', asyncHandler(OAuth2Controller.authenticate), asyncHandler(OAuth2Controller.test));

/**
 * @swagger
 * /api/v1/oauth/revoke:
 *   post:
 *     summary: Revoke access or refresh token
 *     tags: [OAuth2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *               token_type_hint:
 *                 type: string
 *                 enum: [access_token, refresh_token]
 *     responses:
 *       200:
 *         description: Token revoked
 */
router.post('/revoke', asyncHandler(OAuth2Controller.revoke));

router.get('/login', (req: Request, res: Response) => {
  const { client_id, redirect_uri, state, response_type, scope } = req.query;
  res.render('login', {
    client_id,
    redirect_uri,
    state,
    response_type: response_type || 'code',
    scope: scope || '',
    error: null,
  });
});

/**
 * @swagger
 * /api/v1/oauth/client:
 *   post:
 *     summary: Register a new OAuth client
 *     tags: [OAuth2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               clientSecret:
 *                 type: string
 *               callbackUrl:
 *                 type: string
 *               grants:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - clientId
 *               - clientSecret
 *               - callbackUrl
 *     responses:
 *       201:
 *         description: Client registered successfully
 */
router.post('/client', asyncHandler(OAuth2Controller.createClient));

/**
 * @swagger
 * /api/v1/oauth/client:
 *   get:
 *     summary: Get list of OAuth clients
 *     tags: [OAuth2]
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/client', asyncHandler(OAuth2Controller.getClientList));

/**
 * @swagger
 * /api/v1/oauth/client/{clientId}:
 *   delete:
 *     summary: Delete an OAuth client
 *     tags: [OAuth2]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted successfully
 */
router.delete('/client/:clientId', asyncHandler(OAuth2Controller.deleteClient));

export default router;
