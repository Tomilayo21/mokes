'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { X, AlertCircle, CheckCircle, ShoppingCart, LogIn, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";

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

  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateError, setRateError] = useState("");
  const [selectedRate, setSelectedRate] = useState(null);
  const [bookingShipment, setBookingShipment] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const parcel = { length: 10, width: 5, height: 5, distance_unit: "cm", weight: 1, mass_unit: "kg" };

  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod);

  const cartAmount = getCartAmount();
  const vat = cartAmount * 0.075;
  const paymentFeeRate = selectedPayment?.fee || 0;
  const paymentFee = (cartAmount + vat) * paymentFeeRate * 0;
  const shippingFee = selectedShipping ? parseFloat(selectedShipping.amount.amount) : 0;
  const total = cartAmount + vat + paymentFee + shippingFee;
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return; // wait for auth

    let cancelled = false;
    const fetchUserAddresses = async () => {
      try {
        // withCredentials is optional for same-origin; safe to include
        const res = await axios.get("/api/user/get-address", { withCredentials: true });
        const data = res.data;
        if (data.success) {
          if (!cancelled) {
            setUserAddresses(data.addresses || []);
            if ((data.addresses || []).length > 0) setSelectedAddress(data.addresses[0]);
          }
        } else {
          toast.error(data.message || "Failed to load addresses");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to fetch addresses");
      }
    };

    fetchUserAddresses();
    return () => { cancelled = true; };
  }, [status]);

  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!selectedAddress) return;
      try {
        const { data } = await axios.post('/api/shipping/create', {
          addressTo: selectedAddress,
          addressFrom: {
            name: "Shop Admin",
            street1: "123 Market Rd",
            city: "Lagos",
            state: "LA",
            zip: "100001",
            country: "NG",
            phone: "+2348000000000",
            email: "admin@example.com",
          },
          parcel,
        });
        if (data.success && data.rates.length > 0) {
          setShippingOptions(data.rates);
          setSelectedShipping(data.rates[0]);
        } else {
          toast.error("No shipping rates available");
        }
      } catch (err) {
        toast.error("Error fetching shipping rates");
      }
    };

    fetchShippingRates();
  }, [selectedAddress]);

  useEffect(() => setCountries(Country.getAllCountries()), []);

  useEffect(() => {
    if (!selectedCountry) return setStates([]);
    const country = countries.find(c => c.name === selectedCountry);
    setStates(country ? State.getStatesOfCountry(country.isoCode) : []);
    setSelectedState(""); setSelectedCity(""); setCities([]);
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (!selectedCountry || !selectedState) return setCities([]);
    const country = countries.find(c => c.name === selectedCountry);
    const state = states.find(s => s.name === selectedState);
    setCities(country && state ? City.getCitiesOfState(country.isoCode, state.isoCode) : []);
  }, [selectedCountry, selectedState, countries, states]);

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setIsDropdownOpen(false);
  };


  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Please select an address
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );
      return;
    }

    if (status !== "authenticated") {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <LogIn className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Login required
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );
      return;
    }

    if (processing) return;
    setProcessing(true);

    const cartArray = Object.keys(cartItems)
      .map((id) => ({ product: id, quantity: cartItems[id] }))
      .filter((i) => i.quantity > 0);

    if (cartArray.length === 0) {
      setProcessing(false);
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <ShoppingCart className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Cart is empty
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );
      return;
    }

    try {
      const userId = session.user.id; // NextAuth user ID

      if (selectedMethod === "stripe") {
        const { data } = await axios.post("/api/checkout/stripe", {
          items: cartItems,
          address: selectedAddress,
          userId,
        });

        if (!data.url) throw new Error("No Stripe URL returned");

        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            addressId: selectedAddress._id,
            items: cartArray,
            paymentMethod: "stripe",
          })
        );

        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Redirecting to Stripe...
              </p>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );

        window.location.href = data.url;
      } else if (selectedMethod === "paystack") {
        const { data } = await axios.post("/api/checkout/paystack", {
          items: cartItems,
          address: selectedAddress,
          userId,
        });

        if (!data.success) throw new Error("Paystack init failed");

        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            addressId: selectedAddress._id,
            items: cartArray,
            paymentMethod: "paystack",
          })
        );

        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Redirecting to Paystack...
              </p>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );

        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {err.message || "Payment failed"}
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );
    } finally {
      setProcessing(false);
    }
  };  

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;

    try {
      const res = await fetch(`/api/user/add-address/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <Trash2 className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Address deleted
            </p>
          </div>
        ),
        { duration: 2000, position: "top-right" }
      );

      setUserAddresses(prev => prev.filter(addr => addr._id !== id));

    } catch (err) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <Trash2 className="text-red-500" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Delete failed
            </p>
          </div>
        ),
        { duration: 2000, position: "top-right" }
      );
    }
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setShowEditModal(true);
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
    <div className="w-full md:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Order <span className="text-orange-600">Summary</span>
      </h2>
      <hr className="border-gray-200 dark:border-gray-700 my-4 md:my-5" />

      <div className="space-y-4 md:space-y-6">

        {/* Address dropdown */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Shipping Address
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex justify-between items-center px-3 py-2.5 md:px-4 md:py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:ring-1 hover:ring-orange-500 transition"
            >
              {selectedAddress ? `${selectedAddress.fullName}, ${selectedAddress.city}, ${selectedAddress.state}` : "Select Address"}
              <svg className={`w-5 h-5 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {userAddresses.map((addr) => (
                  <li key={addr._id} className="px-3 py-2 hover:bg-orange-50 dark:hover:bg-neutral-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200 flex justify-between items-center">
                    <span onClick={() => handleAddressSelect(addr)}>{addr.fullName}, {addr.city}, {addr.state}, {addr.country}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(addr)}>Edit</button>
                      <button onClick={() => handleDelete(addr._id)}>Delete</button>
                    </div>
                  </li>
                ))}
                <li onClick={() => router.push("/add-address")} className="px-3 py-2 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-neutral-700 cursor-pointer">+ Add New Address</li>
              </ul>
            )}
          </div>
        </div>

        {/* Shipping rates */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Shipping Options</label>
          <button onClick={fetchRates} disabled={loadingRates} className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition mt-2">
            {loadingRates ? "Fetching Rates..." : "Get Shipping Rates"}
          </button>

          {rateError && <p className="text-red-500 text-sm mt-2">{rateError}</p>}

          {rates.length > 0 && (
            <ul className="mt-3 space-y-2">
              {rates.map(rate => (
                <li key={rate.object_id} className={`p-3 border rounded-lg cursor-pointer transition ${selectedRate?.object_id === rate.object_id ? "border-orange-500 bg-orange-50 dark:bg-neutral-800" : "border-gray-300 dark:border-gray-600"}`} onClick={() => setSelectedRate(rate)}>
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-700 dark:text-gray-200">{rate.provider} - {rate.servicelevel?.name}</p>
                    <p className="font-semibold text-orange-600">{rate.amount_local} {rate.currency_local}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {selectedRate && <button onClick={bookShipment} disabled={bookingShipment} className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">{bookingShipment ? "Booking Shipment..." : "Confirm Shipping Option"}</button>}
          {bookingMessage && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{bookingMessage}</p>}
        </div>

        {/* Payment */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Payment Method</label>
          <select value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)} className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 transition">
            {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.label}</option>)}
          </select>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{currency}{cartAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span>VAT (7.5%):</span>
            <span>{currency}{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span>Payment Fee 
              {/* ({selectedPayment?.label} {paymentFeeRate * 100}%) */}
              :</span>
            <span>{currency}{paymentFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{currency}{shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="flex justify-between font-semibold text-gray-900 dark:text-gray-100">
            <span>Total:</span>
            <span>{currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 focus:outline-none"
          >
            {showBreakdown ? (
              <>
                Hide breakdown <ChevronUp size={16} className="ml-1 transition-transform" />
              </>
            ) : (
              <>
                Show breakdown <ChevronDown size={16} className="ml-1 transition-transform" />
              </>
            )}
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showBreakdown ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency}{cartAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between">
                <span>VAT (2%):</span>
                <span>{currency}{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between">
                <span>Payment Fee ({selectedPayment?.label || "N/A"} {paymentFeeRate * 100}%):</span>
                <span>{currency}{paymentFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{currency}{shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="flex justify-between font-semibold text-gray-900 dark:text-gray-100">
                <span>Total:</span>
                <span>{currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Payment button */}
        <button onClick={handlePayment} disabled={processing || getCartCount() === 0} className={`w-full py-3 mt-4 md:mt-5 rounded-lg text-white font-medium transition ${processing || getCartCount() === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 shadow-md"}`}>
          {processing ? "Processing..." : `Pay ${currency}${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </button>

      </div>

      {/* Edit Address Modal */}
      {showEditModal && editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4"><X /></button>
            <h3 className="text-lg font-semibold mb-4">Edit Address</h3>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Address updated"); setShowEditModal(false); }}>
              <input type="text" placeholder="Full Name" defaultValue={editingAddress.fullName} className="w-full mb-2 p-2 border rounded" />
              <input type="text" placeholder="Street" defaultValue={editingAddress.street1} className="w-full mb-2 p-2 border rounded" />
              <input type="text" placeholder="City" defaultValue={editingAddress.city} className="w-full mb-2 p-2 border rounded" />
              <input type="text" placeholder="State" defaultValue={editingAddress.state} className="w-full mb-2 p-2 border rounded" />
              <input type="text" placeholder="Country" defaultValue={editingAddress.country} className="w-full mb-2 p-2 border rounded" />
              <button type="submit" className="w-full mt-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition">Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderSummary;
