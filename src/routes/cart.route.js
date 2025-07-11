import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart, updateCartItem } 
from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/addToCart', addToCart);
router.get('/getCart/:userId', getCart);
router.delete('/remove', removeFromCart);
router.delete('/clear/:userId', clearCart);
router.put('/item/:itemId', updateCartItem);

export default router;
