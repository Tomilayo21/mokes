"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { Loader2, User, Phone, Mail } from "lucide-react";

export default function AddAddressInline({ onSuccess }) {
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

    const handleCountryChange = (e) => {
    const countryCode = e.target.value;

    setAddress((prev) => ({
        ...prev,
        country: countryCode,
        state: "",
        city: "",
    }));

    setStateList(State.getStatesOfCountry(countryCode));
    setCityList([]);
    };

    const handleStateChange = (e) => {
    const stateCode = e.target.value;
    const countryCode = address.country;

    setAddress((prev) => ({
        ...prev,
        state: stateCode,
        city: "",
    }));

    const cities = City.getCitiesOfState(countryCode, stateCode);
    setCityList(cities);
    };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/user/add-address", {
        address,
      });

      if (data.success) {
        toast.custom((t) => (
          <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <div className="flex-1">
              <p className="text-sm font-normal text-black tracking-wide">
                Address Added
              </p>
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 cursor-pointer hover:text-black transition"
            >
              ✕
            </button>

            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
              <div
                className="h-full bg-[var(--sage)]"
                style={{
                  animation: `toast-progress ${t.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ));
        onSuccess?.();

        setAddress({
          fullName: "",
          phoneNumber: "",
          country: "",
          state: "",
          city: "",
          zipcode: "",
          area: "",
          email: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-5 mt-6 bg-white w-full max-w-full min-w-0 overflow-x-hidden box-border">
      <form onSubmit={submit} className="space-y-4 w-full min-w-0 overflow-x-hidden">

        {/* FULL NAME */}
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            className="pl-10 w-full min-w-0 box-border max-w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            placeholder="Full Name"
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />
        </div>

        {/* PHONE */}
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            className="pl-10 w-full min-w-0 box-border max-w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            placeholder="Phone Number"
            value={address.phoneNumber}
            onChange={(e) =>
              setAddress({ ...address, phoneNumber: e.target.value })
            }
          />
        </div>

        {/* EMAIL */}
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            className="pl-10 w-full min-w-0 box-border max-w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            placeholder="Email"
            value={address.email}
            onChange={(e) =>
              setAddress({ ...address, email: e.target.value })
            }
          />
        </div>

        {/* COUNTRY */}
        <select
          value={address.country}
          onChange={handleCountryChange}
          className="w-full min-w-0 max-w-full box-border h-12 appearance-none text-black px-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
        >
          <option value="">Select Country</option>

          {countryList.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>

        {/* ZIP */}
        <input
          className="w-full min-w-0 box-border max-w-full text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
          placeholder="Zipcode"
          value={address.zipcode}
          onChange={(e) =>
            setAddress({ ...address, zipcode: e.target.value })
          }
        />

        {/* AREA */}
        <textarea
            className="w-full min-w-0 box-border max-w-full h-32 resize-none overflow-hidden text-black px-3 py-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            placeholder="Area / Street"
            value={address.area}
            onChange={(e) =>
                setAddress({ ...address, area: e.target.value })
            }
        />

        {/* STATE */}
        <select
            value={address.state}
            onChange={handleStateChange}
            className="w-full min-w-0 max-w-full box-border h-12 appearance-none text-black px-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
            >
            <option value="">Select State</option>
            {stateList.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                {s.name}
                </option>
            ))}
        </select>

        {/* CITY */}
        <select
        value={address.city}
        onChange={(e) =>
            setAddress({
            ...address,
            city: e.target.value,
            })
        }
        className="w-full min-w-0 max-w-full box-border h-12 appearance-none text-black px-3 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
        >
        <option value="">Select City</option>
        {cityList.map((c) => (
            <option key={c.name} value={c.name}>
            {c.name}
            </option>
        ))}
        </select>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="w-full min-w-0 bg-[var(--sage)] text-white hover:bg-zinc-500 py-2.5 rounded-sm cursor-pointer uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex justify-center items-center gap-2">
              Saving...
            </span>
          ) : (
            "Save Address"
          )}
        </button>
      </form>
    </div>
  );
}