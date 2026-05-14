import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext.js";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshCart } = useUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);
  const fetchProduct = async () => {
    if (!id) return;

    try {
      const response = await fetch(`http://localhost:5000/store/products`);
      const result = await response.json();
      if (result.status === "success") {
        const found = result.data.find((p: Product) => p.id === parseInt(id));
        setProduct(found || null);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCart = async () => {
    if (!user) {
      alert("You must log in to add products to the cart");
      return;
    }
    if (!product) return;

    setIsAdding(true);
    try {
      const response = await fetch("http://localhost:5000/store/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          clientId: user.id,
          qty: 1,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        if (refreshCart) await refreshCart();
        alert("Product added to cart!");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Could not connect to the server");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCart = async () => {
    if (!user || !product) return;

    setIsRemoving(true);
    try {
      const response = await fetch("http://localhost:5000/store/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          clientId: user.id,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        if (refreshCart) await refreshCart();
        alert("Product removed from cart");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Connection error");
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen uppercase tracking-widest text-xs">
        Loading...
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen uppercase tracking-widest text-xs">
        Product not found
      </div>
    );

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex bg-gray-50 w-[80%] h-[80vh] rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="w-1/2 bg-gray-200 flex items-center justify-center relative">
          <img
            src={product.image || "https://via.placeholder.com/400"}
            alt={product.name}
            className="object-contain h-full w-full p-10 transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="w-1/2 p-12 flex flex-col justify-center">
          <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-xs mb-2">
            {product.category}
          </span>
          <h1 className="text-5xl font-black text-gray-800 leading-tight mb-4 uppercase">
            {product.name}
          </h1>
          <p className="text-gray-500 text-lg mb-8 font-light italic">
            {product.description || "Description not available."}
          </p>

          <div className="flex items-center justify-between mb-10">
            <span className="text-4xl font-black text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddCart}
            disabled={isAdding}
            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 
                            ${isAdding ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-blue-700"}`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleRemoveCart}
            disabled={isAdding || isRemoving}
            className={`py-3 text-xs font-bold uppercase tracking-widest transition-all
                        ${isRemoving ? "text-gray-400" : "text-red-500 hover:text-red-700 underline underline-offset-4"}`}
          >
            {isRemoving ? "Removing..." : "Remove from cart"}
          </button>
        </div>
      </div>
    </div>
  );
};
