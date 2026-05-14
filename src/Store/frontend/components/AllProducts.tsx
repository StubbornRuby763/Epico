import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  popularity: number;
}

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await fetch("http://localhost:5000/store/products");
        const json = await response.json();
        if (json.status === "success") {
          setProducts(json.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Full Collection
        </h1>
        <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase">
          Explore all {products.length} available products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-2xl border border-gray-100 transition-all duration-500 group-hover:shadow-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-md text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter border border-gray-100">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 space-y-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-black transition-colors">
                {product.name}
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-xl font-light text-black">
                  ${product.price.toFixed(2)}
                </p>
                <span className="text-[10px] text-amber-500 font-bold italic">
                  POP: {product.popularity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
