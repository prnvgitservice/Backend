import express from 'express';
import { addGetintouchForm, getInTouchForm } from '../controllers/getInTouch';

const router = express.Router();

router.post('/addGetInTouch', addGetintouchForm);
router.get('/getInTouchContacts', getInTouchForm);


export default router;
