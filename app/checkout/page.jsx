"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import OrderSummary from "@/components/OrderSummary";
import EditAddressModal from "@/components/EditAddressModal";
import AddAddressInline from "@/components/AddAddressInline";
import PickupModal from "../../components/PickupModal";
import { postcodeMap } from "@/lib/postcodes";
import { STOCK_WEIGHT } from "@/lib/constants";
import toast from "react-hot-toast";
import PaymentSection from "@/components/PaymentSection";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("ship");
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState({
    id: "ikeja",
    name: "LAGOSWORKS Ikeja",
    price: "Free",
    address: "12 Mobolaji Bank Anthony Way, Ikeja, Lagos, Nigeria",
    eta: "Usually ready in 24 hours",
  });
  const [activeLocation, setActiveLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [saveInfo, setSaveInfo] = useState(false);
  const [processing, setProcessing] = useState(false);

  const RADIUS_FILTERS = {
    tight: 5,
    normal: 10,
    wide: 20,
    fallback: 100,
  };

const pickupLocations = [
  {
    id: "ikeja",
    name: "MOKÉS Ikeja",
    address: "12 Mobolaji Bank Anthony Way, Ikeja, Lagos, Nigeria",
    price: "Free",
    lat: 6.6018,
    lng: 3.3515,
    priority: 3,
    stockLevel: "high",
    processingTimeHours: 24,
  },
  {
    id: "victoria-island",
    name: "MOKÉS Victoria Island",
    address: "Victoria Island, Lagos, Nigeria",
    price: "Free",
    lat: 6.4281,
    lng: 3.4219,
    priority: 5,
    stockLevel: "medium",
    processingTimeHours: 12,
  },
  {
    id: "yaba",
    name: "MOKÉS Yaba",
    address: "Yaba, Lagos, Nigeria",
    price: "Free",
    lat: 6.5244,
    lng: 3.3792,
    priority: 4,
    stockLevel: "high",
    processingTimeHours: 8,
  },
  {
    id: "ajah",
    name: "MOKÉS Ajah",
    address: "Ajah, Lagos, Nigeria",
    price: "Free",
    lat: 6.4594,
    lng: 3.6016,
    priority: 3,
    stockLevel: "medium",
    processingTimeHours: 10,
  }
];

  const [pickupStores, setPickupStores] = useState([]);

  const [tempPickup, setTempPickup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [distanceMessage, setDistanceMessage] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (data) setCheckoutData(JSON.parse(data));
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await axios.get("/api/user/get-address");
      if (res.data.success) {
        setUserAddresses(res.data.addresses);
        setSelectedAddress(res.data.addresses?.[0] || null);
      }
    };

    fetchAddresses();
  }, []);

  const calculateScore = (store, userLocation, userPostcode) => {
    const distance = getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      store.lat,
      store.lng
    );

    let score = 0;

    // 1. Distance (most important)
    score += distance * 2;

    // 2. Stock availability
    score += STOCK_WEIGHT[store.stockLevel] || 20;

    // 3. Store priority (hub advantage)
    score -= store.priority * 4;

    // 4. Postcode match bonus
    if (userPostcode && store.supportedPostcodes?.includes(userPostcode)) {
      score -= 25;
    }

    // 5. Processing speed
    score += store.processingTimeHours * 0.4;

    return {
      ...store,
      distance,
      score,
      eta: `${Math.round((distance / 40) * 60)} min drive`,
    };
  };
  const filterByRadius = (stores, userLocation, radiusKm) => {
    return stores.filter((store) => {
      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        store.lat,
        store.lng
      );

      return distance <= radiusKm;
    });
  };


  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  const getFallbackMessage = (store) => {
    if (store.fallback) return "⚠ Nearby warehouse unavailable — fallback selected";
    return null;
  };  

  const getDeliveryPromise = (store) => {
    if (store.distance < 5) return "🚀 Same day pickup";
    if (store.distance < 10) return "⚡ Ready in 24h";
    if (store.distance < 20) return "📦 Ready in 2–3 days";
    return "📦 Extended fulfillment";
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const extractPostcode = (text) => {
    if (!text) return null;
    const match = text.match(/\b\d{6}\b/);
    return match ? match[0] : null;
  };

  const resolveLocation = (input) => {
    if (!input) return null;

    // already a location object
    if (typeof input === "object" && input.lat && input.lng) {
      return input;
    }

    const text = String(input);

    // extract postcode
    const postcode = text.match(/\b\d{6}\b/)?.[0];

    if (postcode && postcodeMap[postcode]) {
      return postcodeMap[postcode];
    }

    // fallback: match area name (optional improvement)
    const match = Object.values(postcodeMap).find((p) =>
      text.toLowerCase().includes(p.area.toLowerCase())
    );

    if (match) return match;

    return null;
  };

  const rankWarehouses = (baseLocation) => {
    return pickupLocations
      .map((store) => {
        const distance = getDistanceKm(
          baseLocation.lat,
          baseLocation.lng,
          store.lat,
          store.lng
        );

        const score =
  distance * 1.2 +
  (STOCK_WEIGHT[store.stockLevel] || 10) -
  store.priority * 3 +
  store.processingTimeHours * 0.2;

        return {
          ...store,
          distance,
          score,
          price: "Free",
          eta: `${Math.round((distance / 40) * 60)} min drive`,
        };
      })
      .sort((a, b) => a.score - b.score);
  };

  const handleSearchClick = () => {
    const text = searchQuery.toLowerCase();

    // 1. postcode match
    const postcode = text.match(/\b\d{6}\b/)?.[0];

    if (postcode && postcodeMap[postcode]) {
      handleSearch(postcodeMap[postcode]);
      return;
    }

    // 2. area match (IMPORTANT FIX)
    const match = Object.entries(postcodeMap).find(([code, data]) =>
      data.area.toLowerCase().includes(text)
    );

    if (match) {
      handleSearch(match[1]);
      return;
    }

    // 3. fallback: no match
    console.log("No location found");
  };

  const fetchSuggestions = (input) => {
    if (!input) return setSuggestions([]);

    const text = input.toLowerCase();

    const results = Object.entries(postcodeMap)
      .filter(([postcode, data]) => {
        return (
          postcode.includes(text) ||
          data.area.toLowerCase().includes(text)
        );
      })
      .map(([postcode, data]) => ({
        place_id: postcode,
        description: `${postcode} - ${data.area}`,
        ...data,
      }));

    setSuggestions(results);
  };
  
  useEffect(() => {
    console.log("searchQuery changed:", searchQuery);
  }, [searchQuery]);

  const selectedWithDistance =
    pickupStores.find((p) => p.id === selectedPickup?.id);

  useEffect(() => {
    if (showPickupModal) {
      setTempPickup(selectedPickup);
    }
  }, [showPickupModal]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedPickup");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedPickup(parsed);
      setTempPickup(parsed);
    }
  }, []);

  const enrichedSelectedPickup = (() => {
    if (!selectedPickup) return null;

    // 1. ALWAYS prefer ranked version (source of truth)
    const ranked = pickupStores.find(p => p.id === selectedPickup.id);

    if (ranked) return ranked;

    // 2. fallback: rebuild from base + active location
    const base = pickupLocations.find(p => p.id === selectedPickup.id);

    if (!base) return selectedPickup;

    let distance = null;

    if (activeLocation) {
      distance = getDistanceKm(
        activeLocation.lat,
        activeLocation.lng,
        base.lat,
        base.lng
      );
    }

    return {
      ...base,
      price: "Free",
      address: base.address || "Pickup store location",
      distance,
      eta: distance ? `${Math.round((distance / 40) * 60)} min drive` : "ETA unavailable",
    };
  })();

  const fetchAddresses = async () => {
    const res = await axios.get("/api/user/get-address");

    if (res.data.success) {
      setUserAddresses(res.data.addresses);
      setSelectedAddress(res.data.addresses?.[0] || null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;

    try {
      const res = await fetch(`/api/user/add-address/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

        toast.custom((t) => (
            <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            >
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                Address deleted
                </p>
            </div>

            <button onClick={() => toast.dismiss(t.id)}>✕</button>

            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
                <div
                className="h-full bg-green-500"
                style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                }}
                />
            </div>
            </div>
        ), {
            duration: 5000,
            position: "top-right",
        });

        await fetchAddresses();

    } catch (err) {
        toast.custom((t) => (
            <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            >
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                Address deleted failed
                </p>
            </div>

            <button onClick={() => toast.dismiss(t.id)}>✕</button>

            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
                <div
                className="h-full bg-green-500"
                style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                }}
                />
            </div>
            </div>
        ), {
            duration: 5000,
            position: "top-right",
        });
    }
  };

  const handlePayment = async (method) => {
    if (!selectedAddress) {
      toast.custom((t) => (
        <div
          className={`max-w-md w-full bg-white shadow-lg rounded-lg p-4 text-sm font-medium text-gray-900 transform transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          Please select an address
        </div>
      ), { duration: 2500, position: "top-right" });

      return;
    }

    if (!checkoutData) {
      toast.custom((t) => (
        <div
          className={`max-w-md w-full bg-white shadow-lg rounded-lg p-4 text-sm font-medium text-gray-900 transform transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          Checkout data missing
        </div>
      ), { duration: 2500, position: "top-right" });

      return;
    }

    if (processing) return;
    setProcessing(true);

    try {
      const payload = {
        method,
        checkoutData,
        address: selectedAddress,
        pickup: selectedPickup,
        deliveryMethod,
        billing: {
          useShippingAsBilling,
          saveInfo,
        },
      };

      // helper toast
      const redirectToast = (text) => {
        toast.custom((t) => (
          <div
            className={`max-w-md w-full bg-white shadow-lg rounded-lg p-4 text-sm font-medium text-gray-900 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            {text}
          </div>
        ), { duration: 2000, position: "top-right" });
      };

      // 🔹 STRIPE
      if (method === "stripe") {
        const { data } = await axios.post("/api/checkout/stripe", payload);

        if (!data?.url) throw new Error("Stripe URL missing");

        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            addressId: selectedAddress._id,
            paymentMethod: "stripe",
          })
        );

        redirectToast("Redirecting to Stripe...");
        window.location.href = data.url;
        return;
      }

      // 🔹 PAYSTACK
      if (method === "paystack") {
        const { data } = await axios.post("/api/checkout/paystack", payload);

        if (!data?.authorizationUrl) throw new Error("Paystack init failed");

        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            addressId: selectedAddress._id,
            paymentMethod: "paystack",
          })
        );

        redirectToast("Redirecting to Paystack...");
        window.location.href = data.authorizationUrl;
        return;
      }

      // 🔹 PAYPAL
      if (method === "paypal") {
        const { data } = await axios.post("/api/payment/paypal", payload);

        if (!data?.url) throw new Error("PayPal URL missing");

        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            addressId: selectedAddress._id,
            paymentMethod: "paypal",
          })
        );

        redirectToast("Redirecting to PayPal...");
        window.location.href = data.url;
        return;
      }

      // 🔹 KLARNA
      if (method === "klarna") {
        toast.custom((t) => (
          <div
            className={`max-w-md w-full bg-white shadow-lg rounded-lg p-4 text-sm font-medium text-gray-900 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            Klarna is not available yet
          </div>
        ), { duration: 2500, position: "top-right" });

        return;
      }

      throw new Error("Invalid payment method");
    } catch (err) {
      toast.custom((t) => (
        <div
          className={`max-w-md w-full bg-white shadow-lg rounded-lg p-4 text-sm font-medium text-red-600 transform transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          {err.message || "Payment failed"}
        </div>
      ), { duration: 2500, position: "top-right" });

    } finally {
      setProcessing(false);
    }
  };
  
  if (!checkoutData) return <div>Loading checkout...</div>;

  return (
    <div className="max-w-6xl mx-auto px-8">
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto py-10">

        {/* LEFT - ADDRESS */}

        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>


        {/* DESKTOP ORDER SUMMARY */}
        <div className="hidden md:block md:w-1/2 pl-6 md:sticky md:top-10 h-fit">
          <OrderSummary
            checkoutData={checkoutData}
            selectedAddress={selectedAddress}
          />
        </div>
      </div>

      {/* EDIT MODAL (reuse yours) */}
      <EditAddressModal
        open={showEditModal}
        editingAddress={editingAddress}
        onClose={() => setShowEditModal(false)}
        onSuccess={(updated) => {
          fetchAddresses();
          setSelectedAddress(updated);
        }}
      />
    </div>
  );
}