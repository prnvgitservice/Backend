import express from 'express';
import { addGetintouchForm, getInTouchForm } from '../../controllers/authControllers/getInTouch.js';

const router = express.Router();

router.post('/addGetInTouch', addGetintouchForm);
router.get('/getInTouchContacts', getInTouchForm);


export default router;
