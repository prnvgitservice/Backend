import Cart from '../models/cart.model.js';

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
  return await Cart.findOne({ userId }).populate('items.serviceId');
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
