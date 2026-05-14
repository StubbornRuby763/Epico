import { useEffect, useState } from "react";
import { useUser } from "./UserContext.js";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export const ShoppingCart = () => {
  const { user, refreshCart, bankToken, setBankToken } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentToken, setPaymentToken] = useState("");

  useEffect(() => {
    const validateBankSession = () => {
      const token = localStorage.getItem("pixel_bank_token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]!));
        if (payload.exp * 1000 < Date.now()) {
          console.warn("Bank token expired, clearing session...");
          localStorage.removeItem("pixel_bank_token");
          setBankToken(null);
        }
      } catch (error) {
        localStorage.removeItem("pixel_bank_token");
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/store/payment-config",
        );
        const config = await response.json();
        if (config.taxRate !== undefined) {
          setTaxRate(config.taxRate);
        }
      } catch (error) {
        console.error("Error fetching bank tax config", error);
      }
    };

    validateBankSession();
    fetchConfig();
    fetchCart();
  }, [user, bankToken, setBankToken]);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `http://localhost:5000/store/cart/${user.id}`,
      );
      const result = await response.json();

      if (result.status === "success" && result.data) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data.items || [];
        setCartItems(items);
        setPaymentToken(
          `pay_${Math.random().toString(36).substring(2)}_${Date.now()}`,
        );
      }
    } catch (error) {
      console.error("Error fetching cart", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBank = () => {
    const bankAuthUrl = "http://localhost:3000/bank/login-with.html";
    const callbackUrl = `${window.location.origin}/store/`;
    window.location.href = `${bankAuthUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  const handlePay = async () => {
    if (!user || isPaying || cartItems.length === 0 || !bankToken) return;

    setIsPaying(true);
    try {
      const response = await fetch("http://localhost:5000/store/cart/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.id,
          bankToken: bankToken,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        alert(`Payment Successful! ID: ${result.transactionId}`);
        localStorage.removeItem("pixel_bank_token");
        setBankToken(null);
        setCartItems([]);
        if (refreshCart) refreshCart();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error: any) {
      console.error("DEBUG PAY ERROR:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const taxes = subtotal * taxRate;
  const finalTotal = subtotal + taxes;

  if (loading)
    return <div className="p-10 text-center">Loading treasures...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-3xl my-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        🛒 Your Cart
        <span className="text-sm font-light text-gray-400">
          ({cartItems.length} items)
        </span>
      </h2>

      <div className="space-y-4 mb-8">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.product.image}
                  className="w-16 h-16 object-cover rounded-lg"
                  alt=""
                />
                <div>
                  <h4 className="font-bold text-gray-700">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-600">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-gray-400">Your cart is empty.</p>
        )}
      </div>

      <div className="border-t pt-6 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span className="font-light">Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-light">
            Bank Taxes ({(taxRate * 100).toFixed(0)}%):
          </span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xl font-medium text-gray-800">
            Total to pay:
          </span>
          <span className="text-3xl font-bold text-black">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-8">
        {bankToken ? (
          <button
            onClick={handlePay}
            disabled={isPaying || cartItems.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              isPaying || cartItems.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 shadow-lg active:scale-95"
            }`}
          >
            {isPaying
              ? "Processing payment..."
              : `Checkout $${finalTotal.toFixed(2)}`}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-red-500 font-semibold">
              You must authorize the payment with your bank account to continue.
            </p>
            <button
              onClick={handleConnectBank}
              className="w-full py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Sign in with Pixel Bank
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-center mt-6 text-gray-400 uppercase tracking-widest">
        Secure transaction: {paymentToken}
      </p>
    </div>
  );
};
