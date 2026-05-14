import { useState } from "react";

export const TopUp = ({ onRefresh }: { onRefresh: () => void }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/bank/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bank_token")}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (response.ok) {
        setAmount("");
        onRefresh();
      }
    } catch (error) {
      console.error("Top-up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
      <h3 className="text-white font-bold mb-4 flex items-center">
        <span className="mr-2 text-blue-500">⚡</span> Quick Top-Up
      </h3>
      <form onSubmit={handleTopUp} className="space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-700"
          required
        />
        <button
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded-lg text-white font-bold"
        >
          {loading ? "Processing..." : "Confirm Top-Up"}
        </button>
      </form>
    </div>
  );
};
