import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


export const getAllUsers = async (req, res) => {
    try{
        const users = await User.findAll({});
        res.status(200).json(users);
    }catch(error){
        console.error("Error fetching User details:", error);
        res.status(500).json({error: "Failed to fetch Users"});
    }
};

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email

  try {
    // Try to find user by email
    let user = await User.findOne({ where: { email: identifier } });

    // If not found by email, try username
    if (!user) {
      user = await User.findOne({ where: { name: identifier } });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret", 
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    mobileno,
    aadhar_number,
    country_code = "91",
    currency_code = "INR",
    otp = "000000",
    profile_img = "https://example.com/default-profile.png",
    pwd,
    account_holder_name = "Default Holder",
    account_number = "0000000000",
    account_iban = "IN00000000000000000000",
    bank_name = "Default Bank",
    bank_address = "Default Address",
    sort_code = "000000",
    routing_number = "000000000",
    account_ifsc = "IFSC0000000",
    language = "en"
  } = req.body;

  if (!name || !email || !password || !mobileno || !aadhar_number) {
    return res.status(400).json({ message: "Name, email, password, mobile number and Aadhar Number are required" });
  }

  try {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingMobile = await User.findOne({ where: { mobileno } });
    if (existingMobile) {
      return res.status(409).json({ message: "Mobile number already in use" });
    }

    const aadharNumber = await User.findOne({ where: { aadhar_number } });
    if (aadharNumber) {
      return res.status(409).json({ message: "Aadhar Number already in use" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = await User.create({
      name,
      email,
      mobileno,
      password: encryptedPassword,
      pwd: pwd || encryptedPassword,
      aadhar_number,
      country_code,
      currency_code,
      otp,
      profile_img,
      account_holder_name,
      account_number,
      account_iban,
      bank_name,
      bank_address,
      sort_code,
      routing_number,
      account_ifsc,
      language,
      token: crypto.randomBytes(8).toString("hex"),
      share_code: crypto.randomBytes(4).toString("hex"),
      status: 1,
      type: 2,
      is_agree: 1,
      usertype: 0,
      created_at: now,
      updated_at: now,
      last_login: now
    });

    // 🔐 Issue JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      jwt: token
    });

  } catch (error) {
    console.error("Registration error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
