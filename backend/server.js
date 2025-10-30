import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes/api.js";
import { checkForAuthentication } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.options(/.*/, cors());

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthentication)

// ✅ CORS setup (for Vite frontend)

// ✅ API routes
app.use("/api", apiRouter);

app.get("/", (req, res) => res.send("Server running..."));


// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
