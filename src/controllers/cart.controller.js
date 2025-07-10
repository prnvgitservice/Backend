import { addToCartService, getCartService,removeFromCartService, clearCartService, updateCartItemService} from '../services/cart.service.js';
import * as Cart from '../services/cart.service.js';

export const addToCart = async (req, res, next) => {
  try {
  
    const result = await Cart.addToCartService(req.body);
      res.status(201).json({
      success: true,
      message: "Cart Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const result = await Cart.getCartService({userId});
     res.status(201).json({
      success: true,
      message: "Cart Created successfully.",
     result,
    });
  } catch (err) {
    next(err);
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user?._id || req.body.userId;

    if (!userId || !serviceId) {
      return res.status(400).json({ success: false, message: "userId and serviceId are required" });
    }

    const cart = await removeFromCartService(userId, serviceId);
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const cart = await clearCartService(userId);
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const itemId = req.params.itemId; // item _id from URL
    const updates = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: 'Missing userId or itemId' });
    }

    const updatedCart = await updateCartItemService(userId, itemId, updates);

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};