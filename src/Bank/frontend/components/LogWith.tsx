import React, { useState } from "react";

export const LoginWith = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/auth-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, password, callbackUrl }),
        },
      );

      const data = await response.json();

      if (response.ok && data.redirect) {
        window.location.href = data.redirect;
      } else {
        setError(data.error || "Authorization failed");
      }
    } catch (err) {
      setError("Failed to connect to the bank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleAuth}
        className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md transition-all"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg shadow-blue-900/20">
            PB
          </div>
          <h2 className="text-white text-3xl font-bold">Authorize Payment</h2>
          <p className="text-slate-400 text-sm mt-2">
            Verify your identity to process the transaction
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">
              Bank Username
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              placeholder="Your Pixel Bank username"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">
              Security PIN / Password
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
        </div>

        <button
          type="submit"
          disabled={loading || !callbackUrl}
          className={`w-full mt-8 font-bold py-4 px-4 rounded-lg transition duration-300 shadow-lg text-white ${
            loading || !callbackUrl
              ? "bg-slate-700 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
          }`}
        >
          {loading ? "Verifying Account..." : "✔ Confirm & Authorize"}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition"
          >
            Cancel and return to store
          </button>
        </div>

        <p className="text-[9px] text-center mt-6 text-slate-600 uppercase tracking-[0.2em]">
          Secure Gateway — Pixel Bank System
        </p>
      </form>
    </div>
  );
};
