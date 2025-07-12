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
      message: "Cart items fetched successfully.",
     result,
    });
  } catch (err) {
    next(err);
  };
}