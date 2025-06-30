import React from 'react';
import PremiumHero from '../components/home/PremiumHero';
import PremiumFeaturedProducts from '../components/home/PremiumFeaturedProducts';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <PremiumHero />
      <PremiumFeaturedProducts />
    </div>
  );
};

export default Home;