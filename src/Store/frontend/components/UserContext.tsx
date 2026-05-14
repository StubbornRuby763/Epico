// UserContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  user: string;
  image?: string;
  id: number;
}

interface UserContextType {
  user: User | null;
  cartItemsCount: number;
  bankToken: string | null;
  setBankToken: (token: string | null) => void;
  updateUser: (userData: User) => void;
  refreshCart: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [bankToken, setBankToken] = useState<string | null>(
    localStorage.getItem("pixel_bank_token"),
  );

  /**
   * Validates if the stored bank token is still valid (not expired)
   */
  const checkToken = () => {
    const savedToken = localStorage.getItem("pixel_bank_token");
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]!));
        if (payload.exp * 1000 < Date.now()) {
          console.log("Expired token detected during initialization");
          localStorage.removeItem("pixel_bank_token");
          setBankToken(null);
        } else {
          setBankToken(savedToken);
        }
      } catch (e) {
        localStorage.removeItem("pixel_bank_token");
        setBankToken(null);
      }
    }
  };

  useEffect(() => {
    checkToken();
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("pixel_bank_token", tokenFromUrl);
      setBankToken(tokenFromUrl);

      window.history.replaceState({}, document.title, "/store/");

      console.log("Token saved successfully. Redirected to Home.");
    } else {
      const savedToken = localStorage.getItem("pixel_bank_token");
      if (savedToken) setBankToken(savedToken);
    }

    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchCartCount(parsedUser.id);
    }
  }, []);

  /**
   * Fetches the number of items in the user's cart from the server
   */
  const fetchCartCount = async (clientId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/store/cart/${clientId}`,
      );
      const json = await response.json();
      if (json.status === "success" && json.data?.items) {
        const total = json.data.items.reduce(
          (acc: number, item: any) => acc + item.quantity,
          0,
        );
        setCartItemsCount(total);
      }
    } catch (e) {
      console.error("Error fetching cart count:", e);
    }
  };

  /**
   * Updates user state and persists data in localStorage
   */
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user_data", JSON.stringify(userData));
    fetchCartCount(userData.id);
  };

  /**
   * Triggers a manual update of the cart count
   */
  const refreshCart = async () => {
    if (user) await fetchCartCount(user.id);
  };

  /**
   * Clears all session data and logs the user out
   */
  const logout = () => {
    setUser(null);
    setCartItemsCount(0);
    setBankToken(null);
    localStorage.removeItem("user_data");
    localStorage.removeItem("pixel_bank_token");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        cartItemsCount,
        bankToken,
        updateUser,
        refreshCart,
        logout,
        setBankToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
