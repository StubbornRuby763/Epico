import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const SearchResults = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/Store/products");
        const result = await response.json();
        if (result.status === "success") {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().startsWith(query.toLowerCase()),
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  }, [query, products]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      if (activeSuggestionIndex < suggestions.length - 1) {
        setActiveSuggestionIndex(activeSuggestionIndex + 1);
      }
    } else if (e.key === "ArrowUp") {
      if (activeSuggestionIndex > 0) {
        setActiveSuggestionIndex(activeSuggestionIndex - 1);
      }
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex > -1 && suggestions[activeSuggestionIndex]) {
        const selectedProduct = suggestions[activeSuggestionIndex];
        setQuery(suggestions[activeSuggestionIndex].name);
        setSuggestions([]);
        navigate(`/product/${selectedProduct.id}`);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div className="flex-1 flex justify-center px-4 relative">
      <div className="w-full max-w-xl relative">
        <input
          className="border border-gray-300 rounded-full px-6 py-2 w-full focus:outline-blue-500 shadow-sm"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {suggestions.map((product, index) => (
              <li
                key={product.id}
                onClick={() => {
                  setQuery(product.name);
                  setSuggestions([]);
                }}
                className={`px-6 py-2 cursor-pointer text-gray-700 font-medium ${
                  index === activeSuggestionIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
