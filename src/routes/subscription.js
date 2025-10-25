import express from 'express';
import { activeAndInActiveSubscriptionCont, addSubscriptionCont, deleteSubscriptionCont, getAllActivePlans, getAllPlans, getSubPlanById, updateSubscriptionCont } from '../controllers/subscription.js';

const router = express.Router();

router.post('/addSubscription', addSubscriptionCont);
router.get('/plans', getAllPlans);
router.get('/activePlans', getAllPlans);
router.get('/plan/:id', getSubPlanById);
router.put('/updateSubscription', updateSubscriptionCont);
router.delete('/deleteSubscription/:id', deleteSubscriptionCont);
router.put('/activeAndInActiveSubscription', activeAndInActiveSubscriptionCont);

export default router;
