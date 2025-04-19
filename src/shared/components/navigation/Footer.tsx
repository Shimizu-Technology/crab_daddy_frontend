// src/shared/components/navigation/Footer.tsx

import { Link } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { restaurant } = useRestaurantStore();
  
  // No need to fetch restaurant data here as it's already being handled by RestaurantProvider
  // This prevents duplicate API calls

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* About column */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-[#E87230]">Crab Daddy</h3>
            <p className="text-gray-300 text-sm">
              Fresh seafood boils and coastal flavors in Guam. Experience our signature Cajun, Garlic, and Lemon Pepper sauces in a vibrant atmosphere.
            </p>
          </div>

          {/* Links column */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-[#0870B0]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/menu" className="text-gray-300 hover:text-white transition-colors duration-200">Menu</Link></li>
              <li><Link to="/cart" className="text-gray-300 hover:text-white transition-colors duration-200">Cart</Link></li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-[#0870B0]">Contact Us</h3>
            <address className="not-italic text-gray-300 text-sm">
              <p>{restaurant?.address || "881 Pale San Vitores Road, Tumon Bay, 96913"}</p>
              <p className="mt-2">Phone: <a href="tel:+16716462722" className="text-[#E87230] hover:text-[#C55A1E] transition-colors duration-200">{restaurant?.phone_number ? restaurant.phone_number : "(671) 646-2722"}</a></p>
              <p className="mt-2">Email: <a href="mailto:info@crabdaddy.com" className="text-[#E87230] hover:text-[#C55A1E] transition-colors duration-200">{restaurant?.contact_email || "info@crabdaddy.com"}</a></p>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} Crab Daddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
