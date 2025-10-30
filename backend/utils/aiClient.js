import axios from "axios";

export async function callAIClient(message) {
  try {
    const response = await axios.post("https://your-external-api.com/analyze", {
      query: message,
    });

    // Return formatted response
    return JSON.stringify(response.data, null, 2);
  } catch (err) {
    console.error("AI API Error:", err.message);
    return "⚠️ Error: Unable to process your request.";
  }
}
