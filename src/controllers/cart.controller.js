import {
  addToCartService,
  getCartService,
  removeFromCartService,
  clearCartService,
} from '../services/cart.service.js';

export const addToCart = async (req, res) => {
  try {
    const { serviceId, quantity, bookingDate } = req.body;
    const userId = req.user._id || req.body.userId;

    if (!serviceId || !bookingDate) {
      return res.status(400).json({ success: false, message: "serviceId and bookingDate are required" });
    }

    const cart = await addToCartService(userId, serviceId, quantity, bookingDate);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id || req.params.userId;
    const cart = await getCartService(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id || req.body.userId;

    const cart = await removeFromCartService(userId, serviceId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id || req.body.userId;
    const cart = await clearCartService(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
