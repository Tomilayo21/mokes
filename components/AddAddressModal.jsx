"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { X, Loader2, User, Phone, Mail, Landmark, MapPinHouse } from "lucide-react";

export default function AddAddressModal({
  open,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    area: "",
    email: "",
  });

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  if (!open) return null;

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;

    setAddress({
      ...address,
      country: countryCode,
      state: "",
      city: "",
    });

    setStateList(State.getStatesOfCountry(countryCode));
    setCityList([]);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    setAddress({
      ...address,
      state: stateCode,
      city: "",
    });

    setCityList(
      City.getCitiesOfState(address.country, stateCode)
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await axios.post(
        "/api/user/add-address",
        { address }
      );

      if (data.success) {
            toast.custom(
              (t) => (
                <div
                  className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                    t.visible
                      ? "translate-x-0 opacity-100"
                      : "translate-x-10 opacity-0"
                  }`}
                >
        
                  {/* Product Info */}
                  <div className="flex-1">
                    <p className="text-sm font-normal text-black tracking-wide">
                      Address Added
                    </p>
    
                  </div>
        
                  {/* Close */}
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 cursor-pointer hover:text-black transition"
                  >
                    ✕
                  </button>
        
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
                    <div
                      className="h-full bg-[var(--sage)]"
                      style={{
                        animation: `toast-progress ${t.duration}ms linear forwards`,
                      }}
                    />
                  </div>
                </div>
              ),
              {
                duration: 5000,
                position: "top-right",
              }
            );
        if (onSuccess) {
          onSuccess(data);
        }

        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-50 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 shadow-xl">

        <button
          onClick={onClose}
          className="absolute text-black cursor-pointer top-4 right-4"
        >
          <X />
        </button>

        <h2 className="text-xl tracking-wide uppercase font-normal text-gray-900 border-b pb-3">
          Add Address
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium mt-2 text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              className="pl-10 w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(e) =>
                setAddress({
                  ...address,
                  fullName: e.target.value,
                })
              }
            />
          </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              className="pl-10 w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
              placeholder="Phone Number"
              value={address.phoneNumber}
              onChange={(e) =>
                setAddress({
                  ...address,
                  phoneNumber: e.target.value,
                })
              }
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              className="pl-10 w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
              placeholder="Email"
              value={address.email}
              onChange={(e) =>
                setAddress({
                  ...address,
                  email: e.target.value,
                })
              }
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
          <input
            className="w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            placeholder="Zipcode"
            value={address.zipcode}
            onChange={(e) =>
              setAddress({
                ...address,
                zipcode: e.target.value,
              })
            }
          />

          <textarea
              className="w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            rows={4}
            placeholder="Area / Street"
            value={address.area}
            onChange={(e) =>
              setAddress({
                ...address,
                area: e.target.value,
              })
            }
          />

          <select
            value={address.country}
            onChange={handleCountryChange}
            className="w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
          >
            <option value="">Select Country</option>
            {countryList.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={address.state}
            onChange={handleStateChange}
            className="w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"

          >
            <option value="">Select State</option>
            {stateList.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={address.city}
            onChange={(e) =>
              setAddress({
                ...address,
                city: e.target.value,
              })
            }
            className="w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"

          >
            <option value="">Select City</option>
            {cityList.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            disabled={loading}
            className="mt-4 w-full bg-[var(--sage)] text-white 
                  hover:bg-zinc-500 py-2.5 
                  rounded-sm cursor-pointer uppercase font-medium disabled:opacity-50  disabled:cursor-not-allowed
                  transition"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Saving...
              </span>
            ) : (
              "Save Address"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}