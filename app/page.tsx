import Image from "next/image";
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection";
import FeaturedProduct from "@/components/FeaturedProduct";
import Products from "@/components/Products";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProduct />
      <Products />
      <Footer />
    </>
  );
}
