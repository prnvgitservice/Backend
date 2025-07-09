import { getAllActivePlansService } from '../services/subscription.service.js';

export const getAllActivePlans = async (req, res) => {
  try {
    const plans = await getAllActivePlansService();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
