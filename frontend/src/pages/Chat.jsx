import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Globe,
  Rocket,
  Factory,
  ShoppingBag,
  Megaphone,
  DollarSign,
  FileText,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";

const sectionIcons = {
  market_research: Globe,
  roadmap: Rocket,
  production: Factory,
  sales: ShoppingBag,
  marketing: Megaphone,
  financials: DollarSign,
  pricing_recommendation: DollarSign,
  summary: FileText,
};

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);

  // Load saved chats
  useEffect(() => {
    const saved = localStorage.getItem("launchmate_chats");
    if (saved) setChats(JSON.parse(saved));
  }, []);

  // Save chats when updated
  useEffect(() => {
    localStorage.setItem("launchmate_chats", JSON.stringify(chats));
  }, [chats]);

  async function handleSend(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setData(null);
    setActiveSection(null);

    try {
      const res = await apiFetch("/chat/send", {
        method: "POST",
        body: JSON.stringify({ message: prompt }),
      });
      if (!res.success) throw new Error(res.error || "Invalid response");

      const chatData = {
        id: Date.now(),
        title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
        prompt,
        data: res.data,
        createdAt: new Date().toLocaleString(),
      };

      setData(res.data);
      setActiveSection(Object.keys(res.data)[0]);
      setChats((prev) => [chatData, ...prev]); // prepend new chat
      setPrompt(""); // clear input
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const sections = data ? Object.keys(data) : [];

  function handleLoadChat(chat) {
    setData(chat.data);
    setActiveSection(Object.keys(chat.data)[0]);
    setSidebarOpen(false);
  }

  function handleNewChat() {
    setData(null);
    setActiveSection(null);
    setPrompt("");
    setSidebarOpen(false);
  }

  return (
    <div className="fixed inset-0 flex bg-linear-to-b from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#1a1a1a] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      {/* Sidebar + Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dim background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 18,
                mass: 1,
              }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-[#222] border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  Previous Chats
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333]"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNewChat}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg mb-4 transition"
              >
                <PlusCircle size={18} />
                New Chat
              </motion.button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {chats.length === 0 && (
                  <p className="text-sm opacity-70">No chats yet.</p>
                )}
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleLoadChat(chat)}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-[#333] transition"
                  >
                    <p className="font-medium truncate">{chat.title}</p>
                    <p className="text-xs opacity-60">{chat.createdAt}</p>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 shadow-md bg-white dark:bg-[#222] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition"
            >
              <Menu />
            </button>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              LaunchMate
            </h1>
          </div>
          <p className="text-sm opacity-70">🚀 AI Product Launch Consultant</p>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {!data && !loading && (
            <p className="text-center opacity-70 mt-20 text-lg">
              👋 Describe your product idea, and I’ll generate a full launch
              plan.
            </p>
          )}

          {loading && (
            <div className="flex flex-col items-center mt-20 text-indigo-500 animate-pulse">
              <Loader2 className="animate-spin mb-3" size={36} />
              <p>Generating your launch plan...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 mt-10 font-medium">
              {error}
            </div>
          )}

          {/* Section buttons */}
          {data && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {sections.map((section) => {
                const Icon = sectionIcons[section] || FileText;
                const isActive = section === activeSection;
                return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white dark:bg-[#2c2c2c] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="capitalize">
                      {section.replaceAll("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active card */}
          <AnimatePresence mode="wait">
            {data && activeSection && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 ${
                  activeSection === "summary"
                    ? "bg-linear-to-br from-indigo-600 to-indigo-500 text-white"
                    : "bg-white dark:bg-[#2c2c2c]"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const Icon = sectionIcons[activeSection] || FileText;
                    return (
                      <Icon className="text-indigo-500 dark:text-indigo-400" />
                    );
                  })()}
                  <h2
                    className={`text-2xl font-semibold capitalize ${
                      activeSection === "summary"
                        ? "text-white"
                        : "text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {activeSection.replaceAll("_", " ")}
                  </h2>
                </div>
                <SectionRenderer data={data[activeSection]} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white dark:bg-[#222] border-t border-gray-200 dark:border-gray-700 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Describe your product idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Recursively render nested content beautifully */
function SectionRenderer({ data }) {
  if (typeof data === "string") {
    return (
      <p className="leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
        {data}
      </p>
    );
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-6 space-y-1">
        {data.map((item, i) => (
          <li key={i}>
            <SectionRenderer data={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {key.replaceAll("_", " ")}:
            </p>
            <div className="pl-4 border-l border-gray-300 dark:border-gray-700 ml-1">
              <SectionRenderer data={value} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <p>{String(data)}</p>;
}
