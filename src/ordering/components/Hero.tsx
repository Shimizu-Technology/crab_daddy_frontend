// src/ordering/components/Hero.tsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ReservationModal } from './reservation/ReservationModal';
import { ChevronDown } from 'lucide-react';

import { useRestaurantStore } from '../../shared/store/restaurantStore';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import fallbackHero from '/crab-daddy-hero.avif';

export function Hero() {
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Get the restaurant from the store
  const restaurant = useRestaurantStore((state) => state.restaurant);
  
  // Pull the dynamic heroImageUrl from the restaurant's admin_settings or fall back to the site settings
  const siteHeroImageUrl = useSiteSettingsStore((state) => state.heroImageUrl);
  const restaurantHeroImageUrl = restaurant?.admin_settings?.hero_image_url;
  
  // Priority: 1. Restaurant's hero image, 2. Site settings hero image, 3. Fallback image
  const backgroundImage = restaurantHeroImageUrl || siteHeroImageUrl || fallbackHero;
  
  // Function to scroll to the next section smoothly
  const scrollToNextSection = useCallback(() => {
    // Get the hero section height to determine how far to scroll
    const heroHeight = document.querySelector('.hero-section')?.clientHeight || window.innerHeight;
    
    // Smooth scroll to the next section
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className="relative w-full">
      {/* Hero section with background image - mobile-first approach */}
      <div 
        className="hero-section w-full h-[100vh] max-h-[100vh] bg-cover bg-center bg-no-repeat flex items-center justify-center relative" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Darker overlay for better text visibility */}
        <div className="absolute inset-0 bg-black opacity-40" />
        {/* Additional gradient overlay for text area */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Hero content - centered on the image with improved mobile spacing */}
        <div className="relative z-10 text-center px-4 py-16 sm:py-24 md:py-32 w-full">
          <div className="animate-fadeIn max-w-4xl mx-auto">
            {/* Main heading with the Crab Daddy Experience text - with enhanced visibility and mobile optimization */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A9ED6] mb-4 sm:mb-6 font-serif drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
              <span className="block sm:inline">Discover the</span><br className="hidden sm:block" />
              <span className="text-[#4A9ED6] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                Crab Daddy Experience
              </span>
            </h1>
            
            {/* Description text - further optimized for mobile */}
            <p className="text-base sm:text-lg md:text-xl text-white mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
              Crab Daddy Guam invites you to dive into a one-of-a-kind seafood boil experience. Our goal is to offer a fun, hands-on dining adventure where getting messy is part of the fun!
            </p>

            {/* Button container with proper spacing and mobile optimization */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              {/* Blue rounded button for View Our Menu - primary action */}
              <Link
                to="/menu"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3
                          text-sm sm:text-base font-medium rounded-full
                          text-white bg-[#0870B0] shadow-md
                          hover:bg-[#4A9ED6] hover:shadow-lg
                          transition-all duration-200 ease-in-out"
              >
                View Our Menu
              </Link>

              {/* Orange Order Now button - high intent action */}
              <Link
                to="/menu"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3
                          rounded-full shadow-md
                          text-sm sm:text-base font-medium text-white bg-[#E87230]
                          hover:bg-[#C55A1E] hover:shadow-lg
                          transition-all duration-200 ease-in-out"
              >
                Order Now
              </Link>
            </div>
            
            {/* Scroll down button with smooth scroll functionality */}
            <div className="mt-12 animate-bounce cursor-pointer" onClick={scrollToNextSection}>
              <ChevronDown className="h-6 w-6 text-white mx-auto opacity-70 hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
      />
    </div>
  );
}
