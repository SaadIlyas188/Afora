import HeroSection from '@/components/home/HeroSection';
import RitualSteps from '@/components/home/RitualSteps';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BundlePromo from '@/components/home/BundlePromo';
import IngredientsSpotlight from '@/components/home/IngredientsSpotlight';
import BrandPromise from '@/components/home/BrandPromise';

export default function Home() {
  return (
    <>
      <HeroSection />
      <RitualSteps />
      <FeaturedProducts />
      <BundlePromo />
      <IngredientsSpotlight />
      <BrandPromise />
    </>
  );
}
