import Cart from '../models/cart.model.js';
import Services from '../models/technician/services.js';
import CaregoryServices from '../models/caregoryServices.js';
import mongoose from "mongoose";
import User from "../models/authModels/user.js";

export const addToCartService = async ({userId, serviceId, quantity}) => {

  if (!serviceId || !userId || !quantity) {
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
  
    const service = await CaregoryServices.findById(serviceId);
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


  let cart = await Cart.findOne({ userId });

  const itemData = {
    serviceId,
    quantity,
    status: 'upcoming',
  };

  if (!cart) {
    cart = new Cart({ userId, items: [itemData] });
  } else {
    const existingItem = cart.items.find(
      item => item.serviceId.toString() === serviceId 
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

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = 404;
    err.errors = ["Cart Not Found For This User Id"];
    throw err;
  }

  // Map cart items with service details
  const detailedItems = await Promise.all(
    cart.items.map(async (item) => {
      const service = await CaregoryServices.findById(item.serviceId).select(
        "serviceName serviceImg servicePrice"
      );

      return {
        _id: item._id,
        serviceId: item.serviceId,
        quantity: item.quantity,
        serviceName: service?.serviceName || null,
        serviceImg: service?.serviceImg || null,
        servicePrice: service?.servicePrice || null,
      };
    })
  );

  return {
    user,
    cart: detailedItems
  };
};


export const removeFromCartService = async ({ userId, serviceId }) => {
  if (!serviceId || !userId) {
    const err = new Error("Validation failed");
    err.statusCode = 401;
    err.errors = ["Service ID and User ID are required."];
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const err = new Error("Invalid Service ID format");
    err.statusCode = 400;
    err.errors = ["Provided Service ID is not valid."];
    throw err;
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const err = new Error("Cart not found for user");
    err.statusCode = 404;
    err.errors = ["Cart not found"];
    throw err;
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    item => item.serviceId.toString() !== serviceId
  );

  if (cart.items.length === initialLength) {
    const err = new Error("Service not found in cart");
    err.statusCode = 404;
    err.errors = ["Service ID not found in user's cart"];
    throw err;
  }

  await cart.save();

  return {
    message: "Service removed from cart successfully",
    cartId: cart._id,
    userId: cart.userId,
    items: cart.items,
  };
};