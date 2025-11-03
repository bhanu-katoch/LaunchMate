import Chat from "../models/Chat.js";
import { runProductLaunchAgent } from "../utils/aiClient.js";

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
    const aiResponse = await runProductLaunchAgent(message);

    // Save chat
    const chat = new Chat({
      response:aiResponse,
      createdBy: req.user._id,
      prompt:message,
    });

    await chat.save();

    res.json({ success: true, ...aiResponse});
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
    const chats = await Chat.find({ createdBy: req.user._id })
    console.log("user",req.user);
    console.log(chats)
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

    await Chat.deleteMany({ createdBy: req.user._id });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    console.error("Error in clearChatHistory:", err);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};
