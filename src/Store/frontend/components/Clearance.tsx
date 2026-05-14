import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext.js";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  popularity: number;
  discount?: {
    percent: number;
    isActive: boolean;
  } | null;
}

export const Clearance = () => {
  const { user, refreshCart } = useUser();

  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClearance = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/store/products/clearance?limit=8",
        );
        const json = await response.json();
        if (json.status === "success") {
          setProducts(json.data);
        }
      } catch (error) {
        console.error("Error loading clearance products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClearance();
  }, []);

  const handleAddProduct = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();

    if (!user) {
      alert("You must log in to make a purchase");
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
        alert("Product added!");
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
        Searching Deals...
      </div>
    );

  return (
    <div className="py-12 bg-gray-50">
      <div className="px-6 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light tracking-tighter text-red-600 uppercase">
            Clearance
          </h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-medium">
            Last chance / Best prices
          </p>
        </div>
        <button className="text-[10px] uppercase font-bold tracking-widest border-b border-red-600 pb-1 text-red-600 hover:text-red-400 transition-colors">
          View All Sales
        </button>
      </div>

      <div className="flex overflow-x-auto gap-6 px-6 pb-8 hide-scrollbar scroll-smooth">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleSeeProduct(product.id)}
            className="flex-shrink-0 w-64 group cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 rounded-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md shadow-lg">
                <p className="text-[10px] font-black uppercase tracking-tighter">
                  -{product.discount?.percent || 50}% OFF
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-sm font-medium text-gray-900 truncate uppercase tracking-tight">
                {product.name}
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through">
                    ${product.price}
                  </span>
                  <p className="text-lg font-bold text-red-600">
                    $
                    {(
                      product.price *
                      (1 - (product.discount?.percent || 50) / 100)
                    ).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={(e) => handleAddProduct(e, product.id)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-black transition-colors duration-300 z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
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
