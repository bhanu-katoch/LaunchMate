// routes/api.js
import express from "express";
import authRouter from "./auth.js";
import chatRouter from "./chat.js";

const router = express.Router();

// Mount routers
router.use("/auth", authRouter);
router.use("/chat", chatRouter);

export default router;
