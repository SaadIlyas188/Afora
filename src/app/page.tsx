import HeroSection from '@/components/home/HeroSection';
import HomeBundles from '@/components/home/HomeBundles';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BundlePromo from '@/components/home/BundlePromo';
import IngredientsSpotlight from '@/components/home/IngredientsSpotlight';
import BrandPromise from '@/components/home/BrandPromise';

const GoldDivider = () => (
  <div className="w-full" style={{ height: '2px', backgroundColor: '#c8a951' }} />
);

export default function Home() {
  return (
    <>
      <HeroSection />
      <HomeBundles />
      <FeaturedProducts />
      <GoldDivider />
      <BundlePromo />
      <IngredientsSpotlight />
      <GoldDivider />
      <BrandPromise />
    </>
  );
}
