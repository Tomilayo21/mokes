'use client';

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "₦";
  const [rememberMe, setRememberMe] = useState(false);

  // -------------------- Auth --------------------
  const [currentUser, setCurrentUser] = useState(null);

  const loginUser = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe, }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.user && data.token) {
        const mongoUser = {
          ...data.user,
          _id: data.user._id, // ensure Mongo _id is included
        };

        setCurrentUser(mongoUser);
        setCartItems(data.user.cartItems || {});
        localStorage.setItem("currentUser", JSON.stringify(mongoUser));

        return { success: true, user: mongoUser, token: data.token };
      }

      throw new Error("Invalid login response");
    } catch (err) {
      throw err;
    }
  };

  const signupUser = async (formData) => {
    try {
      const res = await fetch("/api/authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCartItems({});
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
  };

  //  Persist Auth 
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("authToken");

    if (savedUser && savedToken && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser._id) {
          console.error("Mongo _id missing in savedUser");
        } else {
          setCurrentUser(parsedUser); // now API will receive a valid userId
        }
      } catch (err) {
        console.error("Failed to parse savedUser:", err);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

    // Products 
    const [products, setProducts] = useState([]);
    
    const [cartItems, setCartItems] = useState({});
    const [cartLoaded, setCartLoaded] = useState(false);
    const skipFirstSync = useRef(true);

    // Fetch Cart 
    useEffect(() => {
      const fetchCart = async () => {
        try {
          if (status !== "authenticated" || !session?.user?.id) return;

          const res = await axios.get("/api/cart/get");

          const data = res.data?.cartItems || {};

          setCartItems(data);
          setCartLoaded(true);
        } catch (err) {
          console.error("Failed to fetch cart:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }, [status, session?.user?.id]);

    // UPDATE Cart 
    useEffect(() => {
      if (
        status !== "authenticated" ||
        !cartLoaded
      ) return;

      // 🚨 skip first automatic trigger after hydration
      if (skipFirstSync.current) {
        skipFirstSync.current = false;
        return;
      }

      const updateDBCart = async () => {
        try {
          await axios.post("/api/cart/update", {
            cartItems,
          });
        } catch (err) {
          console.error("Failed to update cart:", err);
        }
      };

      updateDBCart();
    }, [cartItems, status, cartLoaded]);

    const addToCart = async (product, size = "default") => {
      const itemId = product._id;

      let cartData = structuredClone(cartItems);

      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }

      cartData[itemId][size] =
        (cartData[itemId][size] || 0) + 1;

      setCartItems(cartData);
    };

    const updateCartQuantity = (
      productId,
      size,
      quantity
    ) => {
      const updated = structuredClone(cartItems);

      if (!updated[productId]) return;

      if (quantity <= 0) {
        delete updated[productId][size];

        if (Object.keys(updated[productId]).length === 0) {
          delete updated[productId];
        }
      } else {
        updated[productId][size] = quantity;
      }

      setCartItems(updated);
    };

    const getCartCount = () => {
      let total = 0;

      Object.values(cartItems).forEach((sizes) => {
        Object.values(sizes).forEach((qty) => {
          total += qty;
        });
      });

      return total;
    };

    const getCartAmount = () => {
      let total = 0;
      for (const itemId in cartItems) {
        const product = products.find(
          (p) => p._id === itemId
        );

        if (!product) continue;

        const sizes = cartItems[itemId];

        for (const size in sizes) {
          total +=
            (product.offerPrice || 0) *
            sizes[size];
        }
      }
      return Math.round(total * 100) / 100;
    };


  const value = {
    currentUser,
    loginUser,
    signupUser,
    logoutUser,
    currency,
    loading,
    products,
    setProducts,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
