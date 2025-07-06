import Technician from '../../models/authModels/technician.js'
import { generateToken } from '../../utils/generateToken';

export const registerTechnician = async ({ username, phoneNumber, password, confirmPassword, category }) => {
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const existingTech = await Technician.findOne({
    $or: [{ username }, { phoneNumber }]
  });

  if (existingTech) {
    throw new Error('Username or phone number already exists');
  }

  const technician = new Technician({ username, phoneNumber, password, category });
  await technician.save();

  const token = generateToken(technician);

  return {
    technician: {
      id: technician._id,
      username: technician.username,
      phoneNumber: technician.phoneNumber,
      category: technician.category
    },
    token
  };
};

export const loginTechnician = async ({ login, password }) => {
  const technician = await Technician.findOne({
    $or: [{ username: login }, { phoneNumber: login }]
  }).select('+password');

  if (!technician || !(await technician.isPasswordMatch(password))) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(technician);

  return {
    technician: {
      id: technician._id,
      username: technician.username,
      phoneNumber: technician.phoneNumber,
      category: technician.category
    },
    token
  };
};
