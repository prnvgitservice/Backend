import { addToCartService, getCartService, removeFromCartService, clearCartService } from '../services/cart.service.js';

export const addToCart = async (req, res) => {
    try {
        const { userId, serviceId, quantity } = req.body;
        const result = await addToCartService(userId, serviceId, quantity);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await getCartService(userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { userId, serviceId } = req.body;
        const result = await removeFromCartService(userId, serviceId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await clearCartService(userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
