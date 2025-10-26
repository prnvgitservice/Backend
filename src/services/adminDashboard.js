import mongoose from "mongoose";
import BookingService from "../models/bookingServices.js"; // Add .js if needed
import User from "../models/authModels/user.js"; // Add .js if needed
import Technician from '../models/authModels/technician.js'; // Add .js if needed
import CategoryServices from '../models/caregoryServices.js'; // Fix typo and add .js if needed
import Category from "../models/category.js";
import Franchise from "../models/authModels/franchise.js";
import services from "../models/technician/services.js";
import GuestBooking from "../models/guestBooking.js";
import GetInTouch from "../models/authModels/getInTouch.js";


export const getStats = async () => {
    const totalCategories = await Category.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalTechnicians = await Technician.countDocuments({});
    const totalFranchise = await Franchise.countDocuments({});

    // Calculate total revenue from completed bookings
    const completedBookings = await BookingService.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Format the response
    const stats = [
        {
            label: 'Total Categories',
            value: totalCategories.toString(),
        },
        {
            label: 'Total Technicians',
            value: totalTechnicians.toString(),
        },
        {
            label: 'Total Users',
            value: totalUsers.toString(),
        },
        {
            label: 'Total Franchise',
            value: totalFranchise.toString(),
        },
        {
            label: 'Revenue',
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
        },
    ];

    return stats;

}

export const getRecentBookings = async () => {
    const bookings = await BookingService.find({})
        .sort({ createdAt: -1 })
        .limit(5);

    const detailedBookings = await Promise.all(
        bookings.map(async (booking) => {
            const user = await User.findById(booking.userId);
            const technician = await Technician.findById(booking.technicianId);
            const service = await CategoryServices.findById(booking.serviceId);

            return {
                id: booking._id,
                user: user
                    ? {
                        id: user._id,
                        username: user.username,
                        phoneNumber: user.phoneNumber,
                    }
                    : null,
                technician: technician
                    ? {
                        id: technician._id,
                        name: technician.username,
                        phoneNumber: technician.phoneNumber,
                    }
                    : null,
                service: service
                    ? {
                        id: service._id,
                        serviceName: service.serviceName,
                    }
                    : null,
                quantity: booking.quantity,
                bookingDate: booking.bookingDate,
                status: booking.status,
                totalPrice: booking.totalPrice,
                createdAt: booking.createdAt,
            };
        })
    );

    return {
        bookings: detailedBookings,
    };
};

export const getRecentGuestBooking = async () => {
    const bookings = await GuestBooking.find({})
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        bookings
    };
};

export const getRecentGetInTouch = async () => {
    const bookings = await GetInTouch.find({})
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        bookings
    };
};

export const getCategorydetails = async () => {
    const categories = await Category.find();

    const categoriesDetails = await Promise.all(
        categories.map(async (category) => {
            const noOfServices = await  CategoryServices.countDocuments({ categoryId: category._id })

            return {
                id : category._id,
                categoryName : category.category_name,
                noOfServices
            }
        })
    );

    return {
        categoriesDetails
    }
}

export const getMonthlyBookings = async ({year}) => {
// Validate year parameter
    if(!year){
        throw new Error('year is required')
    }
    // Query bookings for the given year with status filter
    const bookings = await BookingService.find({
      createdAt: {
        $gte: new Date(Date.UTC(year, 0, 1)), // Start of year in UTC
        $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)) // End of year in UTC
      },
      status: 'completed' // Add status filter if needed
    });

    // Initialize monthly earnings array
    const monthlyEarnings = Array(12).fill(0).map((_, index) => ({
      month: index + 1,
      monthName: new Date(Date.UTC(year, index, 1)).toLocaleString('default', { month: 'long' }),
      totalEarnings: 0,
      bookingCount: 0
    }));

    // Process bookings
    bookings.forEach(booking => {
      const month = new Date(booking.createdAt).getUTCMonth(); // Use UTC to avoid timezone issues
      const totalPrice = Number(booking.totalPrice) || 0; // Ensure totalPrice is a number
      monthlyEarnings[month].totalEarnings += totalPrice;
      monthlyEarnings[month].bookingCount += 1;
    });

    // Calculate totals and averages
    const totalEarnings = monthlyEarnings.reduce((sum, month) => sum + month.totalEarnings, 0);
    const totalBookings = monthlyEarnings.reduce((sum, month) => sum + month.bookingCount, 0);
    const averageEarningsPerMonth = totalBookings > 0 ? totalEarnings / 12 : 0;
    const averageBookingsPerMonth = totalBookings > 0 ? totalBookings / 12 : 0;

    return {
      year,
      monthlyEarnings,
      totalEarnings,
      totalBookings,
      averageEarningsPerMonth: Number(averageEarningsPerMonth.toFixed(2)),
      averageBookingsPerMonth: Number(averageBookingsPerMonth.toFixed(2)),
      isEmpty: bookings.length === 0 // Indicate if no bookings were found
    };
}