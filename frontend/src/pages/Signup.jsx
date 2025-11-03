import { useState } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-gray-100 shadow-2xl rounded-2xl p-8 transform transition-all hover:scale-[1.02] hover:shadow-indigo-500/10">
        <h2 className="text-3xl font-bold text-left mb-6 text-indigo-600 dark:text-indigo-400">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              placeholder="JohnDoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition duration-300"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.toLowerCase().includes("success")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
