"use client";
import axios from "axios";
import { useEffect, useRef } from "react";
import { postcodeMap } from "@/lib/postcodes";
import { STOCK_WEIGHT } from "@/lib/constants";
import { Search } from "lucide-react";


export default function PickupModal({
  showPickupModal,
  setShowPickupModal,
  showMapModal,
  setShowMapModal,
  searchQuery,
  setSearchQuery,
  suggestions,
  setSuggestions,
  fetchSuggestions,
  handleSearchClick,
  pickupLocations,
  tempPickup,
  setTempPickup,
  selectedPickup,
  setSelectedPickup,
  getDeliveryPromise,
  activeLocation,
  setActiveLocation,
  getDistanceKm,
  pickupStores,
  setPickupStores,
  userLocation,  
}) {

    const handleSearch = (location) => {
    if (!location || !location.lat || !location.lng) return;

    setActiveLocation(location);

    const ranked = pickupLocations
    .map((store) => {
        const distance = getDistanceKm(
        location.lat,
        location.lng,
        store.lat,
        store.lng
        );

        const score =
        distance * 1.2 -
        store.priority * 3 +
        store.processingTimeHours * 0.2;

        const etaMinutes = Math.round((distance / 40) * 60);

        return {
        ...store,
        distance,
        eta: `${etaMinutes} min drive`,
        score,
        };
    })
    .sort((a, b) => a.score - b.score);

    setPickupStores(ranked);

    if (ranked.length > 0) {
        setSelectedPickup(ranked[0]);
        setTempPickup(ranked[0]);
    }
    };

    const mapTarget =
        (showMapModal && (tempPickup || selectedPickup)) || null;

    const baseLocation = activeLocation;

    const tempDistance =
        baseLocation && tempPickup
            ? getDistanceKm(
                baseLocation.lat,
                baseLocation.lng,
                tempPickup.lat,
                tempPickup.lng
            )
            : null;

    useEffect(() => {
        if (showPickupModal) {
            setTempPickup(selectedPickup);
        }
    }, [showPickupModal, selectedPickup]);

    useEffect(() => {
        console.log("ACTIVE:", activeLocation);
        console.log("TEMP PICKUP:", tempPickup);
        console.log("SELECTED:", selectedPickup);
        console.log("DIST:", tempDistance);
    }, [activeLocation, tempPickup, selectedPickup]);

    useEffect(() => {
        if (!activeLocation) return;
        if (!showPickupModal) return;

        setTempPickup((prev) => prev || selectedPickup);
    }, [activeLocation]);

    const displayLocations =
        pickupStores.length > 0 ? pickupStores : pickupLocations;

    const formatDistance = (distance) => {
        if (!distance) return "";

        if (distance < 0.05) return "Within pickup area";
        if (distance < 0.5) return `${Math.round(distance * 1000)} m away`;

        return `${distance.toFixed(1)} km away`;
    };            


    const suggestionRef = useRef(null);

    useEffect(() => {
    function handleClickOutside(event) {
        if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
        ) {
        setSuggestions([]);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, [setSuggestions]);

  return (
    showPickupModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white w-full max-w-xl rounded-lg flex flex-col h-[85vh]">
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-medium text-gray-700">Pickup locations</h2>
            <button 
                onClick={() => setShowPickupModal(false)}
                className="text-black cursor-pointer text-xl"
                >
                    ✕
                </button>
          </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* SEARCH ROW */}

                <div className="flex gap-3 mb-3 items-center">

                {/* COUNTRY SELECT */}
                <button
                    type="button"
                    className="flex items-center gap-2 border rounded px-3 h-11 bg-white min-w-[110px]"
                >
                    <img
                    src="https://flagcdn.com/w40/ng.png"
                    alt="Nigeria"
                    className="w-5 h-4 object-cover rounded-[2px]"
                    />
                    <span className="text-sm font-medium text-black">NG</span>
                </button>

                {/* SEARCH INPUT */}
                <div className="relative flex-1" ref={suggestionRef}>
                    <input
                        value={searchQuery}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);

                            if (value.trim().length > 2) {
                            fetchSuggestions(value);
                            } else {
                            setSuggestions([]);
                            }
                        }}
                        placeholder="Postcode or address"
                        className="
                            w-full
                            border
                            rounded
                            h-11
                            px-4
                            pr-12
                            text-black
                            placeholder:text-gray-600
                            focus:ring-2
                            focus:ring-[var(--sage)]
                            box-border
                            outline-none
                        "
                    />

                    {/* suggestions */}
                    {suggestions.length > 0 && (
                        <div className="absolute z-50 bg-white text-black font-medium border mt-1 w-full rounded shadow max-h-60 overflow-y-auto">
                            {suggestions.map((item) => (
                            <div
                                key={item.place_id}
                                onMouseDown={(e) => {
                                e.preventDefault();

                                const postcode = item.place_id;
                                const location =
                                    postcodeMap[postcode] ||
                                    Object.values(postcodeMap).find(
                                    (p) => p.area === item.area
                                    );

                                if (!location) return;

                                setSearchQuery(`${postcode} - ${location.area}`);
                                setSuggestions([]);

                                const resolved = {
                                    lat: Number(location.lat),
                                    lng: Number(location.lng),
                                    raw: postcode,
                                    area: location.area,
                                };

                                setActiveLocation(resolved);
                                handleSearch(resolved);
                                }}
                                className="p-3 hover:bg-gray-100 cursor-pointer"
                            >
                                <p className="font-medium">{item.description}</p>
                            </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON */}
                <button
                    onClick={handleSearchClick}
                    className="h-11 w-11 bg-black text-white rounded flex items-center justify-center"
                >
                    <Search size={18} />
                </button>
                </div>

                {/* MAP BUTTON */}
                <div className="mt-4">
                    <button
                    onClick={() => setShowMapModal(true)}
                    className="text-sm text-blue-600 underline"
                    >
                    View on map
                    </button>
                </div>

                {/* MAP MODAL */}
                {showMapModal && mapTarget && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden">

                        <div className="flex justify-between p-4 border-b">
                        <h2 className="font-semibold">{mapTarget.name}</h2>
                        <button onClick={() => setShowMapModal(false)}>✕</button>
                        </div>

                        <iframe
                        width="100%"
                        height="400"
                        className="border-0"
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${mapTarget.lat},${mapTarget.lng}&output=embed`}
                        />

                        <div className="p-4 text-sm text-gray-600">
                        {mapTarget.address}
                        </div>
                    </div>
                    </div>
                )}

                {/* DISTANCE */}

                    {typeof tempDistance === "number" && (
                    <div className="space-y-1">
                        <p className="text-sm text-green-600">
                        {tempDistance.toFixed(1)} km away
                        </p>

                        <p className="text-xs text-gray-500">
                        {getDeliveryPromise({ ...tempPickup, distance: tempDistance })}
                        </p>
                    </div>
                    )}
                    {selectedPickup?.fallback && (
                    <p className="text-xs text-orange-500">
                        ⚠ Fallback warehouse
                    </p>
                    )}



                    {/* LIST */}
                    <div className="space-y-3 mt-3">
                    {displayLocations.map((location) => {
                        const distance = getDistanceKm(
                            activeLocation?.lat,
                            activeLocation?.lng,
                            location.lat,
                            location.lng
                        );

                        return (
                        <div
                            key={location.id}
                            onClick={() => setTempPickup(location)}
                            className={`border p-4 rounded cursor-pointer flex justify-between ${
                            tempPickup?.id === location.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200"
                            }`}
                        >
                            <div>
                            <p className="font-medium text-gray-700">{location.name}</p>
                            <p className="text-sm text-gray-600">{location.address}</p>

                            {/* ETA */}
                            <p className="text-sm text-green-600">
                                {location.eta || (distance ? getDeliveryPromise({ distance }) : "")}
                            </p>

                            {/* Distance */}
                            {typeof distance === "number" && !isNaN(distance) && (
                                <>
                                    <p className="text-sm text-blue-600">
                                        {formatDistance(distance)}
                                    </p>
                                </>
                            )}
                            </div>

                            <div className="w-5 h-5 border rounded-full flex items-center justify-center">
                            {tempPickup?.id === location.id && (
                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                            )}
                            </div>
                        </div>
                        );
                    })}
                    </div>
            </div>

          {/* ACTIONS */}
            <div className="border-t p-4 flex justify-end gap-3 bg-white">
            <button
                onClick={() => setShowPickupModal(false)}
                className="px-4 py-2 border rounded text-black cursor-pointer"
            >
                Cancel
            </button>

            <button
                onClick={() => {
                if (!tempPickup) return;

                setSelectedPickup(tempPickup);

                localStorage.setItem(
                    "selectedPickup",
                    JSON.stringify(tempPickup)
                );

                setShowPickupModal(false);
                }}
                className="px-4 py-2 bg-black text-white rounded cursor-pointer"
                disabled={!tempPickup}
            >
                Save
            </button>
            </div>
        </div>
      </div>
    )
  );
}