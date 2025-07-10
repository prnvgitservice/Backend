import Cart from '../models/cart.model.js';
import Services from '../models/technician/services.js';
import '../models/services.model.js';
import mongoose from "mongoose";
import User from "../models/authModels/user.js";

export const addToCartService = async ({userId, serviceId, quantity, bookingDate}) => {
console.log("userId", userId)
  if (!serviceId || !userId || !quantity || !bookingDate) {
      const err = new Error("Validation failed");
      err.statusCode = 401;
      err.errors = ["Service Id, User Id, Quatity, Booking Date all are required."];
      throw err;
    }
  
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      const err = new Error("Invalid Service ID format");
      err.statusCode = 400;
      err.errors = ["Provided Service ID is not valid."];
      throw err;
    }
  
    const service = await Services.findById(serviceId);
    if (!service) {
      const err = new Error("Service not found");
      err.statusCode = 404;
      err.errors = ["Service ID Not Found"];
      throw err;
    }
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
       err.errors = ["User ID Not Found"];
      throw err;
    }
   const today = new Date();
today.setHours(0, 0, 0, 0);

const booking = new Date(bookingDate);
booking.setHours(0, 0, 0, 0);

if (booking < today) {
  const err = new Error("Date Error");
  err.statusCode = 400;
  err.errors = ["Date can't be in the past"];
  throw err;
}


  let cart = await Cart.findOne({ userId });

  const itemData = {
    serviceId,
    quantity,
    bookingDate,
    status: 'upcoming',
  };

  if (!cart) {
    cart = new Cart({ userId, items: [itemData] });
  } else {
    const existingItem = cart.items.find(
      item => item.serviceId.toString() === serviceId && new Date(item.bookingDate).toISOString() === new Date(bookingDate).toISOString()
    );

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push(itemData);
    }
  }

   await cart.save();
    return {
    id: cart._id,
    userId: cart.userId,
    items: cart.items,
  };
};

export const getCartService = async ({ userId }) => {

  if (!userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["User Id is required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid User ID format");
    err.statusCode = 400;
    err.errors = ["Provided User ID is not valid."];
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    err.errors = ["User ID Not Found"];
    throw err;
  }

  const cart = await Cart.findOne({ userId }).populate('items.serviceId');
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = 404;
    err.errors = ["Cart Not Found For This User Id"];
    throw err;
  }

  return {
    user,
    cart,
  };
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