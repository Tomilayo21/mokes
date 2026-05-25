'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

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
      const res = await fetch("/api/auth/signup", {
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

  // -------------------- Persist Auth --------------------
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


 

    // -------------------- Properties --------------------
  // const [properties, setProperties] = useState([]);

  // const fetchProperties = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get("/api/property/list");
  //     const data = res.data;

  //     // ✅ Handle both array and object responses
  //     if (Array.isArray(data)) {
  //       setProperties(data);
  //     } else if (data.success) {
  //       setProperties(data.properties || []);
  //     } else {
  //       toast.error(data.message || "Failed to fetch properties");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching properties:", err);
  //     toast.error("Failed to load properties");
  //   } finally {
  //     setLoading(false); // ✅ always end loading
  //   }
  // };
  // useEffect(() => {
  //   const fetchAllProperties = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get("/api/property/list");
  //       const data = res.data;

  //       if (Array.isArray(data)) {
  //         setProperties(data);
  //       } else if (data.success) {
  //         setProperties(data.properties || []);
  //       } else {
  //         toast.error(data.message || "Failed to fetch properties");
  //       }
  //     } catch (err) {
  //       console.error("Error fetching properties:", err);
  //       toast.error("Failed to load properties");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAllProperties();
  // }, []);


  const value = {
    currentUser,
    loginUser,
    signupUser,
    logoutUser,
    currency,
    loading,
    // properties,      
    // setProperties,
    // fetchProperties
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
