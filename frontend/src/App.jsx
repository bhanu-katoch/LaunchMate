import "./App.css"; // ✅ import CSS file
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { apiFetch } from "./api"; // your axios wrapper with { withCredentials: true }

function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Try accessing any protected route (for example /chat/init)
        await apiFetch("/chat/ping");
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      {/* Protected route */}
      <Route
        path="/"
        element={loggedIn ? <Chat /> : <Navigate to="/login" replace />}
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          !loggedIn ? (
            <Login setLoggedIn={setLoggedIn} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/signup"
        element={
          !loggedIn ? (
            <Signup setLoggedIn={setLoggedIn} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
