"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { X, Loader2 } from "lucide-react";

const EditAddressModal = ({
  open,
  onClose,
  editingAddress,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (!editingAddress) return;

    setAddress({
      fullName: editingAddress.fullName || "",
      phoneNumber: editingAddress.phoneNumber || "",
      email: editingAddress.email || "",
      zipcode: editingAddress.zipcode || "",
      area: editingAddress.area || editingAddress.street1 || "",
      country: editingAddress.country || "",
      state: editingAddress.state || "",
      city: editingAddress.city || "",
    });
  }, [editingAddress]);

  useEffect(() => {
    if (!address?.country) return;

    const states = State.getStatesOfCountry(address.country);
    setStateList(states);
  }, [address?.country]);

  useEffect(() => {
    if (!address?.country || !address?.state) return;

    const cities = City.getCitiesOfState(
      address.country,
      address.state
    );

    setCityList(cities);
  }, [address?.country, address?.state]);

  useEffect(() => {
    if (!open) return;
    }, [open]);

  if (!open) return null;
    if (!address) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await axios.put(
        `/api/user/add-address/${editingAddress._id}`,
        address 
      );

        if (data.success) {
        const updated = data.updatedAddress || data.address || data.data;

        toast.custom((t) => (
            <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            >
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                Address updated successfully
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

        onSuccess?.(updated);

        onClose();
        }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-50 rounded-sm w-full max-w-2xl h-[90vh] flex flex-col shadow-xl">

        {/* HEADER (FIXED) */}
        <div className="flex justify-between items-center p-6 border-b bg-white shrink-0">
          <h2 className="text-xl tracking-wide uppercase font-normal text-gray-900">
            Edit Address
          </h2>

          <button
            onClick={onClose}
            className="text-black cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-address-form" onSubmit={handleSubmit} className="space-y-4">

            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              value={address.fullName}
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            />

            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              value={address.phoneNumber}
              onChange={(e) =>
                setAddress({ ...address, phoneNumber: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            />

            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              value={address.email}
              onChange={(e) =>
                setAddress({ ...address, email: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            />

            <label className="block text-sm font-medium text-gray-700">
              Zipcode
            </label>
            <input
              value={address.zipcode}
              onChange={(e) =>
                setAddress({ ...address, zipcode: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            />

            <label className="block text-sm font-medium text-gray-700">
              Area / Street
            </label>
            <textarea
              rows={4}
              value={address.area}
              onChange={(e) =>
                setAddress({ ...address, area: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            />

            {/* COUNTRY */}
            <select
              value={address.country}
              onChange={handleCountryChange}
              className="w-full text-black px-3 py-2 border rounded-sm"
            >
              <option value="">Select Country</option>
              {countryList.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>

            {/* STATE */}
            <select
              value={address.state}
              onChange={handleStateChange}
              className="w-full text-black px-3 py-2 border rounded-sm"
            >
              <option value="">Select State</option>
              {stateList.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>

            {/* CITY */}
            <select
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              className="w-full text-black px-3 py-2 border rounded-sm"
            >
              <option value="">Select City</option>
              {cityList.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>

          </form>
        </div>

        {/* FOOTER (FIXED) */}
        <div className="border-t p-4 bg-white flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-sm text-black cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-address-form"
            disabled={loading}
            className="px-5 py-2 bg-black text-white rounded-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditAddressModal;