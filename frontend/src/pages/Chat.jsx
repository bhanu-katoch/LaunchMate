import { useState } from "react";
import { apiFetch } from "../api";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleChat() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await apiFetch("/chat/send", {
        method: "POST",
        body: JSON.stringify({ message: prompt }),
      });

      // If backend sends a JSON object, format it nicely
      if (typeof res.data === "object") {
        setResponse(JSON.stringify(res.data, null, 2));
      } else {
        setResponse(res.data);
      }
    } catch (err) {
      setResponse(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <h2 className="text-2xl font-semibold">ProductLaunchGPT</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your product idea..."
        className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
        rows={5}
      />

      <button
        onClick={handleChat}
        disabled={loading}
        className={`px-6 py-2 rounded-lg text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {response && (
        <div className="w-full md:w-2/3 bg-gray-900 text-green-200 font-mono text-sm rounded-lg p-4 overflow-auto whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
