import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Trash2,
  LogIn,
  UserPlus,
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

const CACHE_KEY = "launchmate_chat_cache_v1";
const CACHE_LIMIT = 2;

export default function Chat() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allChats, setAllChats] = useState([]);
  const [cache, setCache] = useState(() => {
    try {
      const s = localStorage.getItem(CACHE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    fetchHistory();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** 🧩 Map backend chat to frontend format */
  function mapBackendChat(c) {
    let data = {};

    if (c.response) {
      if (
        c.response.success &&
        c.response.data &&
        typeof c.response.data === "object"
      ) {
        data = c.response.data;
      } else if (c.response.data && typeof c.response.data === "object") {
        data = c.response.data;
      } else {
        data = c.response;
      }
    } else if (c.data && typeof c.data === "object") {
      data = c.data;
    }

    return {
      id: c._id || c.id || String(Date.now() + Math.random()),
      prompt: c.prompt || "",
      data,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toLocaleString()
        : new Date().toLocaleString(),
      raw: c,
    };
  }

  /** 🧠 Fetch chat history from backend */
  async function fetchHistory() {
    try {
      const res = await apiFetch("/chat/history", { method: "GET" });
      if (!res || !res.success || !Array.isArray(res.chats)) {
        console.warn("No history returned or bad format:", res);
        return;
      }

      const mapped = res.chats
        .filter((c) => c.response?.success && c.response?.data)
        .map(mapBackendChat)
        .reverse();

      if (!mountedRef.current) return;

      setAllChats(mapped);
      const recent = mapped.slice(0, CACHE_LIMIT);
      setCache(recent);
      localStorage.setItem(CACHE_KEY, JSON.stringify(recent));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.warn("localStorage set failed:", err);
    }
  }, [cache]);

  /** ✉️ Handle new message send */
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

      if (!res || !res.success)
        throw new Error(res?.error || "Invalid response");

      const responseData = res.data || res.response || {};

      const newChat = {
        id:
          (res.chat && res.chat._id) ||
          (res.saved && res.saved._id) ||
          Date.now(),
        prompt,
        data: responseData,
        createdAt: new Date().toLocaleString(),
      };

      setData(responseData);
      setActiveSection(Object.keys(responseData)[0] || null);
      setAllChats((prev) => [newChat, ...prev]);
      setCache((prev) => {
        const merged = [newChat, ...prev.filter((c) => c.id !== newChat.id)];
        return merged.slice(0, CACHE_LIMIT);
      });

      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /** ♻️ Clear all chats from backend + local */
  async function handleClearChats() {
    if (!window.confirm("Are you sure you want to clear all chats?")) return;

    try {
      const res = await apiFetch("/chat/clear", { method: "DELETE" });
      if (!res.success) throw new Error(res.error || "Failed to clear chats.");

      setAllChats([]);
      setCache([]);
      localStorage.removeItem(CACHE_KEY);
      setData(null);
      setActiveSection(null);
      alert("✅ All chats cleared!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to clear chats: " + err.message);
    }
  }

  function handleLoadChat(chat) {
    const cached = cache.find((c) => c.id === chat.id);
    if (cached && cached.data) {
      setData(cached.data);
      setActiveSection(Object.keys(cached.data)[0] || null);
    } else if (chat.data) {
      setData(chat.data);
      setActiveSection(Object.keys(chat.data)[0] || null);
      setCache((prev) => {
        const merged = [chat, ...prev.filter((c) => c.id !== chat.id)];
        return merged.slice(0, CACHE_LIMIT);
      });
    } else {
      setError("Chat data not available locally.");
    }

    setSidebarOpen(false);
  }

  function handleNewChat() {
    setData(null);
    setActiveSection(null);
    setPrompt("");
    setSidebarOpen(false);
  }

  const sections = data ? Object.keys(data) : [];

  return (
    <div className="fixed inset-0 flex bg-linear-to-b from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#1a1a1a] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-[#222] border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  All Chats
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333]"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex-1"
                >
                  <PlusCircle size={16} /> New Chat
                </button>
                <button
                  onClick={handleClearChats}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                >
                  <Trash2 size={16} /> Clear
                </button>
              </div>

              <div className="text-sm opacity-80 mb-2">
                (Cached: {cache.length} — backend: {allChats.length})
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {allChats.length === 0 && (
                  <p className="text-sm opacity-70">
                    No chats from server yet.
                  </p>
                )}

                {allChats.map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleLoadChat(c)}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-[#333] transition"
                  >
                    <div className="font-medium truncate">
                      {(c.prompt || "Untitled").slice(0, 80)}
                    </div>
                    <div className="text-xs opacity-60">{c.createdAt}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 text-xs opacity-60">
                Cached locally: last {CACHE_LIMIT} chats.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 shadow-md bg-white dark:bg-[#222] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition"
            >
              <Menu />
            </button>
            <h1
              onClick={() => {
                document
                  .querySelector("main")
                  ?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:opacity-80 transition"
            >
              LaunchMate
            </h1>
          </div>

          {/* 🔒 Logout Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  const res = await apiFetch("/auth/logout", {
                    method: "POST",
                  });

                  if (res?.message === "Logged out successfully") {
                    // Clear local caches and redirect
                    localStorage.clear();
                    sessionStorage.clear();
                    alert("✅ Logged out successfully!");
                    navigate("/login");
                  } else {
                    alert("Logout failed. Please try again.");
                  }
                } catch (err) {
                  console.error("Logout error:", err);
                  alert("An error occurred during logout.");
                }
              }}
              className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition"
            >
              <LogIn size={16} /> Logout
            </button>
          </div>
        </header>

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

          <AnimatePresence mode="wait">
            {data && (
              <motion.div
                key={activeSection || "response-block"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 💬 User Prompt Title */}
                <div className="bg-indigo-50 dark:bg-[#1f1f3a] border border-indigo-200 dark:border-indigo-700 rounded-2xl p-5 text-center shadow-sm">
                  <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
                    “
                    {allChats.find((c) => c.data === data)?.prompt ||
                      prompt ||
                      "Your Product Idea"}
                    ”
                  </h2>
                  {/* <p className="text-sm opacity-70 mt-1">
                    Generated detailed plan based on your idea
                  </p> */}
                </div>

                {/* 🧩 Section Tabs */}
                {activeSection && (
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.28 }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <form
          onSubmit={handleSend}
          className="p-4 bg-white dark:bg-[#222] border-t border-gray-200 dark:border-gray-700 flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              placeholder={
                loading
                  ? "Please wait for the response..."
                  : "Describe your product idea..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              className={`w-full resize-none overflow-y-auto max-h-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed
        ${
          loading
            ? "bg-gray-200 dark:bg-[#333] opacity-70 cursor-not-allowed"
            : "bg-gray-100 dark:bg-[#333]"
        }`}
              disabled={loading}
              onInput={(e) => {
                // Auto-resize height
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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

/** 🌌 Modern Glassy Gradient Recursive Renderer */
function SectionRenderer({ data, depth = 0 }) {
  // 1️⃣ Handle plain text
  if (typeof data === "string") {
    return (
      <p className="text-gray-800 dark:text-gray-100 leading-relaxed tracking-wide whitespace-pre-line">
        {data}
      </p>
    );
  }

  // 2️⃣ Handle arrays
  if (Array.isArray(data)) {
    const isObjectArray = data.every((item) => typeof item === "object");

    if (isObjectArray) {
      return (
        <div className="grid md:grid-cols-2 gap-5">
          {data.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-md p-5 shadow-md border border-white/30 dark:border-white/10 hover:shadow-lg transition-all"
            >
              <SectionRenderer data={item} depth={depth + 1} />
            </div>
          ))}
        </div>
      );
    }

    // Beautified bullet-style list
    return (
      <div className="flex flex-col space-y-3 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-start space-x-3">
            <span className="h-2 w-2 mt-2 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full shadow-md shrink-0"></span>
            <SectionRenderer data={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  // 3️⃣ Handle objects
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);

    return (
      <div className="space-y-6">
        {entries.map(([key, value], i) => {
          const displayTitle = key
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          // Heading hierarchy: larger for top-level, smaller for nested
          const headingClass =
            depth === 0
              ? "text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
              : depth === 1
              ? "text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
              : "text-lg font-semibold text-gray-800 dark:text-gray-100";

          // Transparent gradient glass card
          return (
            <div
              key={i}
              className="rounded-2xl bg-linear-to-br from-white/30 via-white/10 to-white/5 dark:from-[#1c1c1c]/40 dark:via-[#141414]/30 dark:to-[#0e0e0e]/30 backdrop-blur-md border border-white/30 dark:border-white/10 p-6 shadow-md hover:shadow-lg transition-all"
            >
              <h3 className={`${headingClass} mb-3`}>{displayTitle}</h3>

              <div className="pl-3 border-l-2 border-indigo-400/30 dark:border-indigo-500/40 space-y-3">
                <SectionRenderer data={value} depth={depth + 1} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 4️⃣ Fallback
  return (
    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
      {String(data)}
    </p>
  );
}
