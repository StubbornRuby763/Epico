import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { SearchResults } from "./SearchResult.js";
import { useUser } from "./UserContext.js";

//Examples
import shoppingCart from "../../assets/shoopingCart.png";
import logo from "../../assets/logo.png";

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, updateUser, cartItemsCount } = useUser();

  useEffect(() => {
    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      try {
        updateUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error loading user", error);
      }
    }
  }, []);

  const handleLogoClick = () => navigate("/store/");
  const handleLogInClick = () => navigate("/store/login");

  const handleShoppingCartClick = () => {
    navigate("/store/ShoppingCart");
  };

  return (
    <nav className="flex items-center w-full h-[10vh] shadow-lg bg-white px-6 relative z-10">
      <div className="flex-1 flex justify-start">
        <button
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
        </button>
      </div>

      <SearchResults />

      <div className="flex-1 flex justify-end gap-4 items-center">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Welcome
              </span>
              <span className="text-xs font-bold text-black">{user.user}</span>
            </div>

            <div className="relative group">
              <button
                onClick={() => navigate("/store/profile")}
                className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 transition-all"
              >
                <img
                  src={user.image || "https://via.placeholder.com/150"}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-black hover:scale-105 transition-transform"
                />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogInClick}
            className="px-6 py-2 border border-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-all"
          >
            log in
          </button>
        )}

        <button
          onClick={handleShoppingCartClick}
          className="p-2 hover:bg-gray-100 transition-colors rounded-full relative"
        >
          <img src={shoppingCart} alt="Cart" className="w-8 h-8" />
          <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
            {cartItemsCount}
          </span>
        </button>
      </div>
    </nav>
  );
};
