// components/ProductSlider.jsx (modified)
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";


export default function ProductSlider() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // load featured slide from API
  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/featured-slider");
        const json = await res.json();
        if (json.success && Array.isArray(json.slides) && json.slides.length > 0) {
          // map DB slide to UI slide format
          const mapped = json.slides.map((s) => ({
            id: s._id,
            title: s.snapshot?.title ?? "Untitled",
            deal: s.deal || "",
            sale: s.sale || "",
            offerEnd: s.offerEnd ? new Date(s.offerEnd) : null,
            imgSrc: s.snapshot?.imgSrc || "/placeholder.jpg",
            buttonLink: s.buttonLink?.replace("/properties/", "/property/") || `/property/${s.propertyId}`,
            buttonText: s.buttonText || "View Property",
            location: s.snapshot?.location || "",
            price: s.snapshot?.price ? `₦${Number(s.snapshot.price).toLocaleString()}` : "",
          }));
          setSlides(mapped);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error("Failed to load featured slider", err);
      }
    }
    loadFeatured();
  }, []);

  // rotate slides
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides]);

  // countdown logic for the current slide

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const slide = slides[currentSlide];

    const offerDate = slide?.offerEnd ? new Date(slide.offerEnd) : null;

    // always ensure offerDate is valid
    if (!offerDate || isNaN(offerDate.getTime())) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const distance = offerDate.getTime() - now.getTime();

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [slides, currentSlide]);



  if (!slides || slides.length === 0) {
    return null; // nothing rendered
  }

  const property = slides[currentSlide];


  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex transition-transform duration-700 ease-in-out">
        <div key={property.id} className="flex flex-col-reverse md:flex-row items-center justify-between min-w-full py-10 md:py-8 px-6 md:px-20 bg-gray-50 dark:bg-gray-50 gap-10 md:gap-16">
          <div className="flex flex-col md:w-1/2 text-center md:text-left">
            {property.deal && (
              <span className="inline-block px-4 py-1 mb-3 text-xs font-medium bg-blue-100 text-blue-700 rounded-md w-fit mx-auto md:mx-0">
                {property.deal}
              </span>
            )}

            <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 dark:text-gray-900 mb-2">{property.title}</h1>
            <p className="text-gray-600 dark:text-gray-600 mb-2">{property.location}</p>
            <p className="text-lg font-semibold text-blue-600 mb-4">{property.price} <span className="text-sm text-gray-500">({property.sale})</span></p>

            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-3 font-medium tracking-wide">
                Offer ends in:
              </p>
              <div className="flex justify-center md:justify-start gap-3">
                {timeLeft.days > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="relative bg-gray-900 text-white rounded-md shadow-lg w-14 h-16 flex items-center justify-center font-mono text-2xl font-bold">
                      <span>{String(timeLeft.days).padStart(2, "0")}</span>
                    </div>
                    <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 tracking-widest font-medium">DAYS</span>
                  </div>
                )}

                {[
                  { label: "HRS", key: "hours" },
                  { label: "MIN", key: "minutes" },
                  { label: "SEC", key: "seconds" },
                ].map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative bg-gray-900 text-white rounded-md shadow-lg w-14 h-16 flex items-center justify-center font-mono text-2xl font-bold">
                      <span>{String(timeLeft[unit.key]).padStart(2, "0")}</span>
                    </div>
                    <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 tracking-widest font-medium">{unit.label}</span>
                  </div>
                ))}
              </div>



              <Link href={property.buttonLink || "#"}>
                <button className="mt-8 px-8 py-3 bg-blue-600/80 hover:bg-blue-700/80 text-white text-sm font-medium rounded-full shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                  <span>{property.buttonText}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:w-1/2">
            <img src={property.imgSrc} alt={property.title} className="w-[280px] sm:w-[360px] md:w-[480px] lg:w-[560px] h-auto object-cover rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
