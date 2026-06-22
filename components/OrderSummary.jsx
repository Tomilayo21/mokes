'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { X, AlertCircle, CheckCircle, ShoppingCart, LogIn, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "@/components/EditAddressModal";

// Payment methods
const paymentMethods = [
  { id: 'stripe', label: 'Stripe', fee: 0.029, url: null },
  { id: 'paystack', label: 'Paystack', fee: 0.015, url: null },
];

const OrderSummary = () => {
  const { currency, cartItems, getCartCount, getCartAmount } = useAppContext();
    const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('stripe');

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [products, setProducts] = useState([]);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/list");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const parsedCart = useMemo(() => {
    const items = [];

    Object.keys(cartItems).forEach((itemId) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) return;

      Object.entries(cartItems[itemId]).forEach(([size, qty]) => {
        if (qty <= 0) return;

        items.push({
          id: itemId,
          size,
          qty,
          product,
          price: Number(product.offerPrice || product.price || 0),
        });
      });
    });

    return items;
  }, [cartItems, products]);

  const cartAmount = useMemo(() => {
    return parsedCart.reduce((sum, item) => {
      return sum + item.price * item.qty;
    }, 0);
  }, [parsedCart]);

  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateError, setRateError] = useState("");
  const [selectedRate, setSelectedRate] = useState(null);
  const [bookingShipment, setBookingShipment] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const parcel = { length: 10, width: 5, height: 5, distance_unit: "cm", weight: 1, mass_unit: "kg" };
  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod);
  const vat = cartAmount * 0.075;
  const paymentFeeRate = selectedPayment?.fee || 0;
  const paymentFee = (cartAmount + vat) * paymentFeeRate * 0;
  const shippingFee = selectedShipping ? parseFloat(selectedShipping.amount.amount) : 0;
  const total = cartAmount + vat + paymentFee + shippingFee;
  const [showBreakdown, setShowBreakdown] = useState(false);


  const handleProceedToCheckout = () => {
    if (!selectedAddress) {
      toast.error("Select address");
      return;
    }

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        address: selectedAddress,
        paymentMethod: selectedMethod,
        shipping: selectedRate,
        total,
        cartItems,
      })
    );

    router.push("/checkout");
  };


  const fetchRates = async () => {
    if (!selectedAddress) return toast.error("Select address first");
    setLoadingRates(true); setRateError("");
    try {
      const { data } = await axios.post("/api/shipping/create", { parcel, addressTo: selectedAddress });
      if (!data.success) throw new Error(data.message || "Failed to fetch rates");
      setRates(data.rates);
      if (data.rates.length > 0) setSelectedRate(data.rates[0]);
    } catch (err) {
      setRateError(err.message);
    } finally {
      setLoadingRates(false);
    }
  };

  const bookShipment = async () => {
    if (!selectedRate) return toast.error("Select a shipping rate first");
    setBookingShipment(true); setBookingMessage("");
    try {
      const { data } = await axios.post("/api/shipping/book", { parcel, rateId: selectedRate.object_id });
      if (!data.success) throw new Error(data.message);
      setBookingMessage(`✅ Shipment booked! Tracking #: ${data.transaction.tracking_number}`);
    } catch (err) {
      setBookingMessage(`❌ ${err.message}`);
    } finally {
      setBookingShipment(false);
    }
  };

  

  return (
    <div className="w-full md:w-full bg-white p-4 md:p-6">
      <h2 className="hidden md:block text-lg font-medium text-black tracking-tight">
        Order Summary
      </h2>
      <hr className="hidden md:block border-gray-200 dark:border-gray-700 my-4 md:my-5" />

      <div className="space-y-4 md:space-y-6">
        
        {/* Payment button */}
        {/* // <button onClick={handlePayment} disabled={processing || getCartCount() === 0} className={`w-full py-3 mt-4 md:mt-5 rounded-lg text-white font-medium transition ${processing || getCartCount() === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 shadow-md"}`}>
        //   {processing ? "Processing..." : `Pay ${currency}${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        // </button> */}

        {/* <button
          onClick={handleProceedToCheckout}
          disabled={processing || getCartCount() === 0}
          className={`w-full py-3 rounded-lg text-white font-medium ${
            processing ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          Proceed to Checkout
        </button>
                 */}
      </div>

      {/* ORDER SUMMARY STYLE BREAKDOWN */}
      <div className="p-4 bg-white space-y-4">

        {/* CART ITEMS LIST */}
        <div className="space-y-4">

          {parsedCart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex gap-3 border-b pb-3 border-gray-200 dark:border-gray-700"
            >
              {/* IMAGE */}
              <img
                src={item.product.image?.[0]}
                className="w-14 h-16 object-cover rounded-md bg-gray-50"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">
                  {item.product.brand?.toUpperCase()} | {item.product.name}
                </p>

                <p className="text-xs text-gray-500">
                  Size: {item.size}
                </p>

                <p className="text-xs text-gray-500">
                  Qty: {item.qty}
                </p>

                <p className="text-xs font-medium text-gray-700 mt-1">
                  {currency}{item.price.toLocaleString()} × {item.qty}
                </p>
              </div>

              {/* LINE TOTAL */}
              <div className="text-xs font-semibold text-gray-900">
                {currency}
                {(item.price * item.qty).toLocaleString()}
              </div>
            </div>
          ))}

        </div>

        {/* CLEAN SUMMARY (SHOPIFY STYLE) */}
        <div className="space-y-3 text-sm text-gray-700">

          {/* SUBTOTAL (includes items only) */}
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {currency}
              {cartAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* VAT (hidden from clutter but included in total) */}
          <div className="flex justify-between">
            <span>Tax (7.5%)</span>
            <span>
              {currency}
              {vat.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* SHIPPING */}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shippingFee > 0
                ? `${currency}${shippingFee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`
                : "—"}
            </span>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 my-3" />

        {/* TOTAL (with currency label like your example) */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-base text-gray-900">
            <span>Total</span>
            <span>
              {currency}
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderSummary;
