import HeroSection from "@/components/HeroSection";
import FeaturedProduct from "@/components/FeaturedProduct";
import Products from "@/components/Products";
import Footer from "@/components/Footer";
// import ProductListPanel from "@/components/Admin/ProductListPanel";
// import AddProductPanel from "@/components/Admin/AddProductPanel";
// import BlogPage from "@/components/Admin/BlogPage";
import BlogSection from "@/components/BlogSection";
// import BlogEditor from "@/components/Admin/BlogEditor";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProduct />
      <Products />
      <BlogSection />

      {/* <AddProductPanel />
      <ProductListPanel /> */}
      {/* <BlogPage />
      <BlogEditor /> */}
      <Footer />
    </>
  );
}
