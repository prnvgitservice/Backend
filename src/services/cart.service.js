// src/services/cart.service.js
import Cart from '../models/cart.model.js';

export const addToCartService = async (userId, serviceId, quantity = 1) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ serviceId, quantity }] });
  } else {
    const existingItem = cart.items.find(item => item.serviceId.toString() === serviceId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ serviceId, quantity });
    }
  }

  return await cart.save();
};

export const getCartService = async (userId) => {
  return await Cart.findOne({ userId }).populate('items.serviceId');
};

export const removeFromCartService = async (userId, serviceId) => {
  return await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { serviceId } } },
    { new: true }
  );
};

export const clearCartService = async (userId) => {
  return await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  );
};
