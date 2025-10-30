import Chat from "../models/Chat.js";
import { callAIClient } from "../utils/aiClient.js";

/**
 * Ping - verify authentication (used by frontend)
 */
export const pingUser = (req, res) => {
  if (!req.user) return res.status(401).json({ success: false });
  res.json({ success: true });
};

/**
 * Send message and get AI response
 */
export const sendMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Call external AI API
    const aiResponse = await callAIClient(message);

    // Save conversation to DB
    const chat = new Chat({
      userId: req.user.id,
      userMessage: message,
      aiResponse,
      createdAt: new Date(),
    });
    await chat.save();

    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ error: "Failed to process chat" });
  }
};

/**
 * Fetch chat history
 */
export const getChatHistory = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const chats = await Chat.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, chats });
  } catch (err) {
    console.error("Error in getChatHistory:", err);
    res.status(500).json({ error: "Failed to load chat history" });
  }
};

/**
 * Clear user chat history
 */
export const clearChatHistory = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await Chat.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    console.error("Error in clearChatHistory:", err);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};
