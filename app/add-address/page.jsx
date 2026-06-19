// "use client";
// import { assets } from "@/assets/assets";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useAppContext } from "@/context/AppContext";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { Country, State, City } from "country-state-city";
// import countries from "i18n-iso-countries";
// import enLocale from "i18n-iso-countries/langs/en.json";
// import { MapPin, Phone, User, Mail, Globe, Loader2, Locate, Map, MapPinHouse, Landmark } from "lucide-react";

// countries.registerLocale(enLocale);

// const AddAddress = () => {
//   const { getToken } = useAuth();
//   const router = useRouter();

//   const [address, setAddress] = useState({
//     fullName: "",
//     phoneNumber: "",
//     country: "",
//     state: "",
//     city: "",
//     zipcode: "",
//     area: "",
//     email: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [countryList, setCountryList] = useState([]);
//   const [stateList, setStateList] = useState([]);
//   const [cityList, setCityList] = useState([]);

//   useEffect(() => {
//     setCountryList(Country.getAllCountries());
//   }, []);

//   const handleCountryChange = (e) => {
//     const countryCode = e.target.value;
//     setAddress({ ...address, country: countryCode, state: "", city: "" });
//     setStateList(State.getStatesOfCountry(countryCode));
//     setCityList([]);
//   };

//   const handleStateChange = (e) => {
//     const stateCode = e.target.value;
//     setAddress({ ...address, state: stateCode, city: "" });
//     setCityList(City.getCitiesOfState(address.country, stateCode));
//   };

//   const handleCityChange = (e) => {
//     setAddress({ ...address, city: e.target.value });
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     const token = await getToken();

//     if (!token) {
//       toast.error("Please login first");
//       return;
//     }

//     if (
//       !address.fullName ||
//       !address.phoneNumber ||
//       !address.zipcode ||
//       !address.area ||
//       !address.city ||
//       !address.state ||
//       !address.country ||
//       !address.email
//     ) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data } = await axios.post(
//         "/api/user/add-address",
//         { address },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         localStorage.setItem("addressId", data.addressId);
//         toast.success(data.message);
//         router.push("/cart");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message || error.message || "Something went wrong"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col mt-8  md:flex-row justify-between gap-12">
//         {/* Address Form */}
//         <form
//           onSubmit={onSubmitHandler}
//           className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-md border border-gray-200"
//         >
//           <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
//             Add Shipping <span className="text-orange-600">Address</span>
//           </h2>

//           <div className="space-y-4 mt-8">
//             {/* Full Name */}
//             <div className="relative">
//               <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Full name"
//                 className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                 value={address.fullName}
//                 onChange={(e) =>
//                   setAddress({ ...address, fullName: e.target.value })
//                 }
//               />
//             </div>

//             {/* Phone */}
//             <div className="relative">
//               <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Phone number"
//                 className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                 value={address.phoneNumber}
//                 onChange={(e) =>
//                   setAddress({ ...address, phoneNumber: e.target.value })
//                 }
//               />
//             </div>

//             {/* Email */}
//             <div className="relative">
//               <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="email"
//                 placeholder="Email"
//                 className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                 value={address.email}
//                 onChange={(e) =>
//                   setAddress({ ...address, email: e.target.value })
//                 }
//               />
//             </div>

//             {/* Zipcode */}
//             <div className="relative">
//               <MapPinHouse className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 name="zipcode"
//                 placeholder="Zip Code"
//                 value={address.zipcode}
//                 onChange={(e) => setAddress({ ...address, zipcode: e.target.value })}
//                 className="pl-10 pr-3 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//               />
//             </div>


//             {/* Address */}
//             <div className="space-y-1">
//               <label className="flex items-center space-x-2 text-gray-700 font-medium">
//                 <Landmark className="w-5 h-5 text-orange-500" />
//                 <span>Address (Area and Street)</span>
//               </label>

//               <textarea
//                 rows={4}
//                 placeholder="Enter your area and street"
//                 className="px-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//                 value={address.area}
//                 onChange={(e) => setAddress({ ...address, area: e.target.value })}
//               ></textarea>
//             </div>

//             {/* Country */}
//             <select
//               value={address.country}
//               onChange={handleCountryChange}
//               className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//             >
//               <option value="">Select Country</option>
//               {countryList.map((c) => (
//                 <option key={c.isoCode} value={c.isoCode}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>

//             {/* State */}
//             <select
//               value={address.state}
//               onChange={handleStateChange}
//               disabled={!stateList.length}
//               className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-50"
//             >
//               <option value="">Select State</option>
//               {stateList.map((s) => (
//                 <option key={s.isoCode} value={s.isoCode}>
//                   {s.name}
//                 </option>
//               ))}
//             </select>

//             {/* City */}
//             <select
//               value={address.city}
//               onChange={handleCityChange}
//               disabled={!cityList.length}
//               className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-50"
//             >
//               <option value="">Select City</option>
//               {cityList.map((c, i) => (
//                 <option key={i} value={c.name}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>

//             {/* Save Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-orange-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 "Save Address"
//               )}
//             </button>
//           </div>
//         </form>

//         {/* Side Image */}
//         <div className="flex-1 flex justify-center items-center">
//           <Image
//             className="max-w-md w-full object-contain"
//             src={assets.my_location_image}
//             alt="Location illustration"
//           />
//         </div>
//         {/* <div className="flex-1 flex justify-center items-center">
//           <MapPin className="w-40 h-40 text-orange-600 opacity-80" />
//         </div> */}
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default AddAddress;








































'use client';
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { MapPin, Phone, User, Mail, Landmark, MapPinHouse, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

countries.registerLocale(enLocale);

const AddAddress = () => {
  const router = useRouter();
<<<<<<< HEAD
  const { data: session } = useSession(); // get session data

=======
  const { data: session, status } = useSession();
  
>>>>>>> 23a0e14294faea8de94f25ac5ce61e77808ed254
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

  const [loading, setLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setAddress({ ...address, country: countryCode, state: "", city: "" });
    setStateList(State.getStatesOfCountry(countryCode));
    setCityList([]);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setAddress({ ...address, state: stateCode, city: "" });
    setCityList(City.getCitiesOfState(address.country, stateCode));
  };

  const handleCityChange = (e) => {
    setAddress({ ...address, city: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // ✅ Get token from context or fallback to localStorage
<<<<<<< HEAD
    if (status === "loading") return;

    if (!session) {
      toast.error("Please login first");
      return;
    }
=======
   if (status === "loading") return;

  if (!session) {
    toast.error("Please login first");
    return;
  }
>>>>>>> 23a0e14294faea8de94f25ac5ce61e77808ed254

    if (
      !address.fullName ||
      !address.phoneNumber ||
      !address.zipcode ||
      !address.area ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.email
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
     const { data } = await axios.post("/api/user/add-address", { address });

      if (data.success) {
        localStorage.setItem("addressId", data.addressId);
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col mt-8 md:flex-row justify-between gap-12">
        {/* Address Form */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-md border border-gray-200"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Add Shipping <span className="text-orange-600">Address</span>
          </h2>

          <div className="space-y-4 mt-8">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full name"
                className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                value={address.fullName}
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Phone number"
                className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                value={address.phoneNumber}
                onChange={(e) =>
                  setAddress({ ...address, phoneNumber: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="pl-10 pr-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                value={address.email}
                onChange={(e) =>
                  setAddress({ ...address, email: e.target.value })
                }
              />
            </div>

            {/* Zipcode */}
            <div className="relative">
              <MapPinHouse className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="zipcode"
                placeholder="Zip Code"
                value={address.zipcode}
                onChange={(e) =>
                  setAddress({ ...address, zipcode: e.target.value })
                }
                className="pl-10 pr-3 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="flex items-center space-x-2 text-gray-700 font-medium">
                <Landmark className="w-5 h-5 text-orange-500" />
                <span>Address (Area and Street)</span>
              </label>

              <textarea
                rows={4}
                placeholder="Enter your area and street"
                className="px-3 py-2.5 border rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                value={address.area}
                onChange={(e) =>
                  setAddress({ ...address, area: e.target.value })
                }
              ></textarea>
            </div>

            {/* Country */}
            <select
              value={address.country}
              onChange={handleCountryChange}
              className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="">Select Country</option>
              {countryList.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* State */}
            <select
              value={address.state}
              onChange={handleStateChange}
              disabled={!stateList.length}
              className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">Select State</option>
              {stateList.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* City */}
            <select
              value={address.city}
              onChange={handleCityChange}
              disabled={!cityList.length}
              className="px-3 py-2.5 border rounded-lg w-full text-gray-700 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">Select City</option>
              {cityList.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-orange-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>

        {/* Side Image */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            className="max-w-md w-full object-contain"
            src={assets.my_location_image}
            alt="Location illustration"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
