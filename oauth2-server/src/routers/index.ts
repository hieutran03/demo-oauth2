import { Router } from 'express';
import AppRouterName from './router.name';

const router = Router();

router.use(AppRouterName.user, require('./user').default);
router.use(AppRouterName.oauth, require('./oauth').default);

export default router;
