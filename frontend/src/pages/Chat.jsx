import { useState } from "react";
import { apiFetch } from "../api";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  async function handleChat() {
    try {
      const data = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: prompt }),
      });
      setResponse(data.text);
    } catch (err) {
      setResponse(err.message);
    }
  }

  return (
    <div>
      <h2>Chat</h2>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={handleChat}>Send</button>
      <p>{response}</p>
    </div>
  );
}
