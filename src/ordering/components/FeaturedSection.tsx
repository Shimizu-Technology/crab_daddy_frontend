// src/ordering/components/FeaturedSection.tsx
import { Link } from 'react-router-dom';

export function FeaturedSection() {
  return (
    <div className="bg-gray-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-[#0870B0] mb-8 text-center font-serif">
          Fresh Seafood Boils
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left column with text and CTA */}
          <div className="flex flex-col justify-center">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-[#E87230] mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-serif">Explore Our Seafood Boils</h3>
              <p className="text-gray-600 mb-6">
                Discover our fresh seafood boils with signature Cajun, Garlic, and Lemon Pepper sauces. Experience the best seafood in Guam with our coastal flavors.
              </p>
              {/* Consistent button styling - using blue for primary actions */}
              <Link to="/menu" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#0870B0] hover:bg-[#4A9ED6] transition-colors duration-200">
                View Full Menu
              </Link>
            </div>
          </div>

          {/* Right column with feature icons */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Interactive feature tiles - 2x2 grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Seafood Boils */}
              <Link to="/menu" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#E87230] text-2xl">🦐</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">Seafood Boils</h4>
                <p className="text-gray-500 text-sm">Fresh seafood with signature sauces</p>
              </Link>

              {/* Quick Order */}
              <Link to="/menu" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#E87230] text-2xl">⚡</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">Quick Order</h4>
                <p className="text-gray-500 text-sm">Easy and fast online ordering</p>
              </Link>

              {/* Easy Checkout */}
              <Link to="/checkout" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#E87230] text-2xl">✓</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">Easy Checkout</h4>
                <p className="text-gray-500 text-sm">Simple payment process</p>
              </Link>

              {/* Special Items */}
              <Link to="/menu?special=true" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#E87230] text-2xl">🌟</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">Special Items</h4>
                <p className="text-gray-500 text-sm">Seasonal and featured dishes</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedSection;
