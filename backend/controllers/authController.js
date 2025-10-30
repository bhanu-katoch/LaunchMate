import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { setUser } from "../service/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res.status(201).json({ message: "User created successfully", user: { id: user._id, username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    // ✅ store token in httpOnly cookie
    const token = setUser(user)
    // res.cookie("token",token)
    res.cookie("token", token, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      // maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({message: "Login successful", user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
