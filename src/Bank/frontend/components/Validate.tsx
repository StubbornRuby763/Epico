import React, { useState } from "react";

interface Box {
  userInitial?: string;
  passwordInitial?: string;
}

export const Login = ({ userInitial = "", passwordInitial = "" }: Box) => {
  const [isLogin, setIsLogin] = useState(true);

  const [user, setUser] = useState(userInitial);
  const [password, setPassword] = useState(passwordInitial);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const API_BASE = "http://localhost:3000";

    const endpoint = isLogin
      ? `${API_BASE}/api/v1/login`
      : `${API_BASE}/api/v1/register`;

    const payload = isLogin
      ? { user, password }
      : { user, password, balance: parseFloat(balance) };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Operation failed");
      }

      if (isLogin) {
        console.log("Login successful, saving token...");
        localStorage.setItem("bank_token", data.token);
        window.location.href = data.redirect;
      } else {
        alert("Account created successfully! You can now log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Request error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md transition-all"
      >
        <div className="text-center mb-8">
          <h2 className="text-white text-3xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? "Log in to 'Pixel Bank' online" : "Join us today"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              placeholder="Your username"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">
                Initial Balance ($)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-8 font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg ${
            isLogin
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-green-600 hover:bg-green-500 text-white"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Processing..." : isLogin ? "Log In" : "Register Account"}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
          >
            {isLogin
              ? "Don't have an account? Sign up here"
              : "Already have an account? Log in"}
          </button>
        </div>
      </form>
    </div>
  );
};
