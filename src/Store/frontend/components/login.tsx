import React, { useState } from "react";

interface BoxProps {
  userInitial?: string;
  passwordInitial?: string;
}

export const Login = ({ userInitial = "", passwordInitial = "" }: BoxProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(userInitial);
  const [password, setPassword] = useState(passwordInitial);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const API_BASE = "http://localhost:5000";
    const endpoint = isLogin
      ? `${API_BASE}/store/login`
      : `${API_BASE}/store/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Operation failed");

      if (isLogin) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
        window.location.href = data.redirect;
      } else {
        alert("Account created successfully!");
        setIsLogin(true);
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      {visible ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
      )}
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg transition-all"
      >
        <div className="text-center mb-10">
          <h2 className="text-gray-900 text-4xl font-light tracking-tight">
            {isLogin ? "Nexus Store" : "Join Us"}
          </h2>
          <p className="text-gray-400 text-sm mt-3 uppercase tracking-widest font-medium">
            {isLogin ? "Secure Login" : "New Account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs p-4 rounded-lg mb-8 text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-none bg-transparent text-gray-800 border-b border-gray-200 focus:outline-none focus:border-black transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2 ml-1">
              Password
            </label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 rounded-none bg-transparent text-gray-800 border-b border-gray-200 focus:outline-none focus:border-black transition-colors"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-2 bottom-4 text-gray-400 hover:text-black p-2 transition-colors"
            >
              <EyeIcon visible={isPasswordVisible} />
            </button>
          </div>

          {!isLogin && (
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2 ml-1">
                Confirm Password
              </label>
              <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-none bg-transparent text-gray-800 border-b border-gray-200 focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
                className="absolute right-2 bottom-4 text-gray-400 hover:text-black p-2 transition-colors"
              >
                <EyeIcon visible={isConfirmPasswordVisible} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-12 py-4 px-4 text-xs uppercase tracking-[0.2em] font-bold transition-all border ${
            loading
              ? "bg-gray-100 text-gray-400 border-gray-100"
              : "bg-black text-white border-black hover:bg-white hover:text-black"
          }`}
        >
          {loading ? "Processing" : isLogin ? "Sign In" : "Create"}
        </button>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setIsPasswordVisible(false);
              setIsConfirmPasswordVisible(false);
            }}
            className="text-gray-400 hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors"
          >
            {isLogin ? "Create an account" : "Back to login"}
          </button>
        </div>
      </form>
    </div>
  );
};
