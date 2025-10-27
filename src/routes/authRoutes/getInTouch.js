import express from 'express';
import { addGetintouchForm, getInTouchForm, updateGetInTouchStatusCont } from '../../controllers/authControllers/getInTouch.js';

const router = express.Router();

router.post('/addGetInTouch', addGetintouchForm);
router.get('/getInTouchContacts', getInTouchForm);
router.put("/updateStaus/:bookingId/:status", updateGetInTouchStatusCont);


export default router;
