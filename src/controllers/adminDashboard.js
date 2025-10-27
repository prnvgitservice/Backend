import * as adminServies from '../services/adminDashboard.js';

export const getStats = async(req, res, next) => {
    try {
        const result = await adminServies.getStats();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
        
    }
};

export const getRecentBookingsController = async (req, res, next) => {
    try {
        const result = await adminServies.getRecentBookings();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getRecentGuestBooking = async (req, res, next) => {
    try {
        const result = await adminServies.getRecentGuestBooking();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getRecentTechnicians = async (req, res, next) => {
    try {
        const result = await adminServies.getRecentTechnicians();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
};


export const getRecentGetInTouch = async (req, res, next) => {
    try {
        const result = await adminServies.getRecentGetInTouch();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategorydetails = async ( req, res , next) => {
    try {
        const result = await adminServies.getCategorydetails();
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
}

export const getMonthlyBookings = async ( req, res, next) =>{
    try {
        const {year} = req.params;
        const result = await adminServies.getMonthlyBookings({year});
        res.status(201).json({
            success: true,
            message: result?.message,
            result: result,
        });
    } catch (err) {
        next(err);
    }
}