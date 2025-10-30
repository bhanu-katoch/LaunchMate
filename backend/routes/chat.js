import express from "express";
import {
  pingUser,
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/chatController.js";

const router = express.Router();

// Routes
router.post("/", (req, res) => {
  res.send({ text: "hi connected succesfully!" });
});
router.get("/ping", pingUser);
router.post("/send", sendMessage);
router.get("/history", getChatHistory);
router.delete("/clear", clearChatHistory);

export default router;
