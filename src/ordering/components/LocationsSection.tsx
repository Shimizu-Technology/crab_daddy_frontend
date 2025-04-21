// src/ordering/components/LocationsSection.tsx
import { MapPin, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LocationsSection() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-[#0870B0] mb-4 font-serif">
            Our Locations & Hours
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visit us at either of our two convenient locations in Guam. Our Tumon location is now open!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agaña Location */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.0308122333395!2d144.74944!3d13.4745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x671f827a3d0e9f73%3A0xf2e1e3c7b0b7c2d0!2s117%20E%20Marine%20Dr%2C%20Hag%C3%A5t%C3%B1a%2C%2096910%2C%20Guam!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Agaña Location Map"
                className="absolute inset-0"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-serif">Agaña Location</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">117 E Marine Drive</p>
                    <p className="text-gray-700">Hagåtña, 96910</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">(671) 477-2722</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">Mon - Thurs: 11am - 3pm, 5pm-9pm</p>
                    <p className="text-gray-700">Fri - Sun: 11am - 9pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tumon Location */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
            {/* NEW badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-[#0870B0] text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
            </div>
            
            <div className="h-48 bg-gray-200 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.0308122333395!2d144.79944!3d13.5145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x671f827a3d0e9f73%3A0xf2e1e3c7b0b7c2d0!2s881%20Pale%20San%20Vitores%20Rd%2C%20Tumon%20Bay%2C%2096913%2C%20Guam!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Tumon Location Map"
                className="absolute inset-0"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-serif flex items-center">
                Tumon Location
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">881 Pale San Vitores Road</p>
                    <p className="text-gray-700">Tumon Bay, 96913</p>
                    <p className="text-gray-600 text-sm mt-1">Located in Holiday Resort in Tumon, Ground floor</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">(671) 646-2722</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-[#E87230] mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-gray-700">Mon - Thurs: 11am - 3pm, 5pm-9pm</p>
                    <p className="text-gray-700">Fri - Sun: 11am - 9pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-flex items-center justify-center px-6 py-3
                      text-base font-medium rounded-full
                      text-white bg-[#E87230] shadow-md
                      hover:bg-[#C55A1E] hover:shadow-lg
                      transition-all duration-200 ease-in-out"
          >
            Order Online Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LocationsSection;
