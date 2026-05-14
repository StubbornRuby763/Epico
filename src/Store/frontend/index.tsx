import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { TopBar } from "./components/topBar.js";
import { Login } from "./components/login.js";
import { Profile } from "./components/Profile.js";
import { TopProducts } from "./components/TopProducts.js";
import { ShoppingCart } from "./components/ProductsCart.js";
import { Banner } from "./components/Banner.js";
import { Clearance } from "./components/Clearance.js";
import { ProductPage } from "./components/ProductPage.js";
import { AllProducts } from "./components/AllProducts.js";

import { UserProvider } from "./components/UserContext.js";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/*Use URL/assets/banner.png*/}
      <Banner url="http://localhost:8000/assets/banner.png" />
      <TopProducts />
      <Clearance />
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/store/All")}
          className="px-8 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full border border-black hover:bg-white hover:text-black transition-all duration-300 shadow-md hover:shadow-xl active:scale-95"
        >
          See More
        </button>
      </div>
    </div>
  );
};
const Store = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div>
          <TopBar />
          <Routes>
            <Route path="/store/" element={<Home />} />

            <Route path="/store/All" element={<AllProducts />} />
            <Route path="/store/login" element={<Login />} />
            <Route path="/store/profile" element={<Profile />} />
            <Route path="/store/ShoppingCart" element={<ShoppingCart />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(<Store />);
}
