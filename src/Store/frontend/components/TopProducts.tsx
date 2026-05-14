import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext.js";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  popularity: number;
  category: string;
}

export const TopProducts = () => {
  const { user, refreshCart } = useUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/store/products/trending?limit=8",
        );
        const json = await response.json();
        if (json.status === "success") {
          setProducts(json.data);
        }
      } catch (error) {
        console.error("Error loading trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleAddProduct = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!user) {
      alert("You must log in to purchase");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/store/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          clientId: user.id,
          qty: 1,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        await refreshCart();
        alert("Added to your treasures!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSeeProduct = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading)
    return (
      <div className="text-center p-10 uppercase tracking-widest text-xs">
        Sailing to find trends...
      </div>
    );

  return (
    <div className="py-12 bg-white">
      <div className="px-6 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-black uppercase">
            Top Trending
          </h2>
          <p className="text-amber-500 text-[10px] uppercase tracking-[0.3em] font-bold">
            Elite Selections / Most Wanted
          </p>
        </div>
        <button className="text-[10px] uppercase font-bold tracking-widest border-b-2 border-amber-400 pb-1 text-black hover:text-amber-600 transition-all">
          Explore Popular
        </button>
      </div>

      <div className="flex overflow-x-auto gap-8 px-6 pb-8 hide-scrollbar scroll-smooth">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleSeeProduct(product.id)}
            className="flex-shrink-0 w-72 group cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-3xl border border-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-amber-100">
                <span className="text-amber-500">🔥</span>
                <p className="text-[10px] font-bold text-gray-800">
                  {product.popularity}
                </p>
              </div>

              <div className="absolute bottom-4 left-4">
                <span className="bg-black text-white text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-bold text-gray-800 truncate uppercase tracking-wide">
                {product.name}
              </h3>

              <div className="flex justify-between items-center">
                <p className="text-2xl font-light text-gray-900">
                  ${product.price.toFixed(2)}
                </p>

                <button
                  onClick={(e) => handleAddProduct(e, product.id)}
                  className="bg-black text-white p-3 rounded-2xl hover:bg-amber-500 transition-all duration-300 shadow-lg active:scale-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
