import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    
    // You can store the model's structured response here
    response: {
      type: mongoose.Schema.Types.Mixed, // <— allows storing objects or arrays
      required: true,
    },

    // optional for storing chat context
    prompt: { type: String },
    // model_response: { type: String },

    // useful for versioning or saving multiple responses
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "users"
    }
  },
  { minimize: true }
);

export default mongoose.model("Chat", chatSchema);
