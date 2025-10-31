import { useState } from "react";
import { apiFetch } from "../api";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  async function handleChat() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    setParsedData(null);
    setActiveTab(null);

    try {
      const res = await apiFetch("/chat/send", {
        method: "POST",
        body: JSON.stringify({ message: prompt }),
      });

      let data = res.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // keep as string
        }
      }

      if (typeof data === "object" && data !== null) {
        setParsedData(data);
        setResponse(JSON.stringify(data, null, 2));
        setActiveTab(Object.keys(data)[0]);
      } else {
        setResponse(String(data));
      }
    } catch (err) {
      setResponse(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Recursive renderer for ANY value (string, object, array)
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="ml-3">
              {typeof item === "object" ? (
                <div className="pl-3 border-l border-gray-600">
                  {renderValue(item)}
                </div>
              ) : (
                <span className="text-gray-200">{String(item)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(value).map(([key, val]) => (
            <div
              key={key}
              className="p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <h4 className="text-blue-300 font-semibold mb-1">
                {key.replace(/_/g, " ")}
              </h4>
              {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-200 whitespace-pre-line">{String(value)}</p>;
  };

  const renderTabContent = (data, tab) => {
    const section = data[tab];
    if (!section) return <p>No data available for this section.</p>;
    return renderValue(section);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-center">ProductLaunchGPT</h2>

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
        <div className="w-full md:w-2/3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Response
            </h3>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="px-3 py-1 text-sm rounded-md bg-blue-700 text-white hover:bg-blue-800"
            >
              {showRaw ? "Show Beautiful View" : "Show Raw JSON"}
            </button>
          </div>

          <div className="bg-gray-900 text-green-200 font-mono text-sm rounded-lg p-4 overflow-auto whitespace-pre-wrap">
            {showRaw ? (
              <pre>{response}</pre>
            ) : parsedData ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-700 pb-2">
                  {Object.keys(parsedData).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                        activeTab === key
                          ? "bg-blue-700 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {key.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  {renderTabContent(parsedData, activeTab)}
                </div>
              </div>
            ) : (
              <pre>{response}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
