import express from 'express';
import { addToCart, getCart, removeFromCartServiceCont } 
from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/addToCart', addToCart);
router.get('/getCart/:userId', getCart);
router.put('/removeFromCartService', removeFromCartServiceCont);

export default router;
