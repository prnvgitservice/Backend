import { Router } from 'express';
import { addFranchiseSubscriptionPlanCont, getFranchiseSubscriptionPlanCot } from '../../controllers/franchase/franchiseSubscriptionDetails.js';

const router = Router();

router.post('/addFranchiseSubscriptionPlan', addFranchiseSubscriptionPlanCont);
router.get('/getFranchiseSubscriptionPlan/:franchiseId', getFranchiseSubscriptionPlanCot);

export default router;