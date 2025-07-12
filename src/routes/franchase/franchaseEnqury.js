import express from 'express';
import { addFranchaseEnquiryCont, getAllFranchaseEnquiriesCont } from '../../controllers/franchase/franchaseEnqury.js';

const router = express.Router();

router.post('/addFranchaseEnquiry', addFranchaseEnquiryCont);
router.get('/getAllFranchaseEnquiries', getAllFranchaseEnquiriesCont);


export default router;
