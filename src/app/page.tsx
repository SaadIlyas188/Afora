import HeroSection from '@/components/home/HeroSection';
import HomeBundles from '@/components/home/HomeBundles';
import RitualSteps from '@/components/home/RitualSteps';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BundlePromo from '@/components/home/BundlePromo';
import IngredientsSpotlight from '@/components/home/IngredientsSpotlight';
import BrandPromise from '@/components/home/BrandPromise';

const GoldDivider = () => (
  <div className="flex items-center justify-center py-2 px-6 md:px-12">
    <div className="w-full max-w-[1400px]">
      <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(200,169,81,0.35), transparent)' }} />
    </div>
  </div>
);

export default function Home() {
  return (
    <>
      <HeroSection />
      <HomeBundles />
      <RitualSteps />
      <FeaturedProducts />
      <GoldDivider />
      <BundlePromo />
      <IngredientsSpotlight />
      <BrandPromise />
    </>
  );
}
