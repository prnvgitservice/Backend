import Cart from '../models/cart.model.js';
import '../models/services.model.js';
import mongoose from "mongoose";

export const addToCartService = async (userId, serviceId, quantity = 1, bookingDate) => {
  let cart = await Cart.findOne({ userId });

  const itemData = {
    serviceId,
    quantity,
    bookingDate,
    status: 'upcoming', // default
    // otp is generated via model default
  };

  if (!cart) {
    cart = new Cart({ userId, items: [itemData] });
  } else {
    const existingItem = cart.items.find(
      item => item.serviceId.toString() === serviceId && new Date(item.bookingDate).toISOString() === new Date(bookingDate).toISOString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push(itemData);
    }
  }

  return await cart.save();
};

export const getCartService = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }

  return await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
    .populate('items.serviceId');
};

export const removeFromCartService = async (userId, serviceId) => {
  return await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { serviceId } } },
    { new: true }
  ).populate('items.serviceId');
};

export const clearCartService = async (userId) => {
  return await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  );
};

export const updateCartItemService = async (userId, itemId, updates) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) throw new Error('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw new Error('Item not found in cart');

  if (updates.quantity !== undefined) item.quantity = updates.quantity;
  if (updates.bookingDate !== undefined) item.bookingDate = updates.bookingDate;
  if (updates.status !== undefined) item.status = updates.status;
  if (updates.otp !== undefined) item.otp = updates.otp;

  return await cart.save();
};