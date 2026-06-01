import Image from "next/image";
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection";
import FeaturedProduct from "@/components/FeaturedProduct";
import Products from "@/components/Products";
import Footer from "@/components/Footer";
import ProductListPanel from "@/components/Admin/ProductListPanel";
import AddProductPanel from "@/components/Admin/AddProductPanel";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProduct />
      <Products />
      {/* <AddProductPanel />
      <ProductListPanel /> */}
      <Footer />
    </>
  );
}
