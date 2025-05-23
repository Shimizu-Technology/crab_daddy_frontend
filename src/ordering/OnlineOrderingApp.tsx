// src/ordering/OnlineOrderingApp.tsx

import React, { useEffect, Suspense, useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';

import { Hero } from './components/Hero';
import { MenuPage } from './components/MenuPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import MerchandisePage from './components/MerchandisePage';
import AdminDashboard from './components/admin/AdminDashboard';
import { LoadingSpinner } from '../shared/components/ui';
import { LoginForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm, VerifyPhonePage } from '../shared/components/auth';
import { OrderHistory } from './components/profile/OrderHistory';
import { ProfilePage } from '../shared/components/profile';
import FeaturedSection from './components/FeaturedSection';
import LocationsSection from './components/LocationsSection';

import { useMenuStore } from './store/menuStore';
import { useCategoryStore } from './store/categoryStore';
import { useLoadingStore } from './store/loadingStore';
import { useAuthStore } from './store/authStore';
import { useMerchandiseStore } from './store/merchandiseStore';
import { MenuItem as MenuItemCard } from './components/MenuItem';
import { useSiteSettingsStore } from './store/siteSettingsStore'; // <-- IMPORTANT
import { useRestaurantStore } from '../shared/store/restaurantStore';
import { useMenuLayoutStore } from './store/menuLayoutStore';
import { validateRestaurantContext } from '../shared/utils/tenantUtils';
import type { MenuItem, MenuItemFilterParams } from './types/menu';

import { ProtectedRoute, AnonymousRoute, PhoneVerificationRoute } from '../shared';

function OrderingLayout() {
  const loadingCount = useLoadingStore((state) => state.loadingCount);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [timerId, setTimerId] = React.useState<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (loadingCount > 0) {
      // Start a short timer so spinner doesn't show if loading is very quick
      if (!timerId) {
        const id = setTimeout(() => {
          setShowSpinner(true);
          setTimerId(null);
        }, 700);
        setTimerId(id);
      }
    } else {
      // No more loading → clear timer and hide spinner
      if (timerId) {
        clearTimeout(timerId);
        setTimerId(null);
      }
      setShowSpinner(false);
    }
  }, [loadingCount, timerId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <main className="flex-grow tropical-pattern">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>

      {showSpinner && (
        <div
          className="
            fixed top-0 left-0 w-screen h-screen
            bg-black bg-opacity-40 
            flex items-center justify-center
            z-[9999999]
          "
        >
          <div className="bg-gray-800 p-6 rounded shadow-lg flex flex-col items-center">
            <LoadingSpinner />
            <p className="mt-3 text-white font-semibold">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnlineOrderingApp() {
  const { fetchFeaturedItems } = useMenuStore();
  const { fetchSiteSettings } = useSiteSettingsStore(); // <-- destructure the store method
  const { fetchCollections } = useMerchandiseStore();
  const { restaurant } = useRestaurantStore();
  const { initializeLayout } = useMenuLayoutStore();
  
  // State for featured items and loading state
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [featuredItemsLoading, setFeaturedItemsLoading] = useState(false);

  // Initialize menu layout preferences based on restaurant settings
  useEffect(() => {
    if (restaurant?.id) {
      console.debug('OnlineOrderingApp: Initializing menu layout preferences');
      initializeLayout(restaurant.id);
    }
  }, [restaurant?.id, initializeLayout]);

  useEffect(() => {
    // Initialize WebSocket connection as soon as the app loads
    // Use silent mode during initial load to reduce console noise
    const isInitialLoad = !restaurant;
    if (validateRestaurantContext(restaurant, isInitialLoad)) {
      console.debug('OnlineOrderingApp: Initializing WebSocket connection for menu items');
      const { startMenuItemsWebSocket, stopInventoryPolling } = useMenuStore.getState();
      
      // Ensure any existing polling is stopped before starting WebSocket
      stopInventoryPolling();
      
      // Only initialize WebSocket if user is authenticated
      const user = useAuthStore.getState().user;
      const isAuthenticated = !!user;
      
      if (isAuthenticated) {
        // Initialize WebSocketManager with restaurant ID for proper tenant isolation
        import('../shared/services/WebSocketManager').then(({ default: webSocketManager }) => {
          if (restaurant && restaurant.id) {
            webSocketManager.initialize(restaurant.id.toString());
            startMenuItemsWebSocket();
          }
        });
      } else {
        console.debug('OnlineOrderingApp: Skipping WebSocket initialization for unauthenticated user');
      }
      
      // Prefetch all menu items data when the app initializes
      prefetchMenuData();
      
      // Double-check that polling is stopped after WebSocket connection
      setTimeout(() => {
        if (useMenuStore.getState().inventoryPollingInterval !== null) {
          console.debug('OnlineOrderingApp: Stopping lingering inventory polling after WebSocket connection');
          stopInventoryPolling();
        }
      }, 1000);
      
      return () => {
        console.debug('OnlineOrderingApp: Cleaning up WebSocket connection');
        stopInventoryPolling();
      };
    }
  }, [restaurant]);
  
  // Function to prefetch menu data at app initialization
  const prefetchMenuData = async () => {
    if (!validateRestaurantContext(restaurant)) {
      console.warn('OnlineOrderingApp: Restaurant context missing, cannot prefetch menu data');
      return;
    }
    
    try {
      console.debug('OnlineOrderingApp: Prefetching menu data at app initialization');
      
      // Get menu store methods
      const { 
        fetchVisibleMenuItems, 
        fetchMenus, 
        fetchMenuItemsForAdmin 
      } = useMenuStore.getState();
      const { fetchCategoriesForMenu } = useCategoryStore.getState();
      const { user } = useAuthStore.getState();
      
      // Check if user has admin privileges
      const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
      
      // 1. Fetch menus first to get the current menu ID
      await fetchMenus();
      
      // 2. Get the current menu ID after fetching menus
      const { currentMenuId } = useMenuStore.getState();
      
      if (currentMenuId) {
        // 3. Fetch categories for the current menu
        await fetchCategoriesForMenu(currentMenuId, restaurant?.id);
        
        // 4. Prefetch data for customer-facing menu page
        console.debug('OnlineOrderingApp: Prefetching customer-facing menu data');
        
        // 4a. Prefetch "All Items" view (no category filter)
        await fetchVisibleMenuItems(undefined, restaurant?.id, false, false);
        
        // 4b. Get categories after they've been fetched
        const { categories } = useCategoryStore.getState();
        const menuCategories = categories.filter((cat: { menu_id: number; id: number; name: string }) => 
          cat.menu_id === currentMenuId
        );
        
        // 4c. Prefetch first few categories (limit to 3 to avoid too many requests)
        const categoriesToPrefetch = menuCategories.slice(0, 3);
        
        for (const category of categoriesToPrefetch) {
          console.debug(`OnlineOrderingApp: Prefetching customer data for category ${category.name}`);
          await fetchVisibleMenuItems(category.id, restaurant?.id, false, false);
        }
        
        // 5. Only prefetch admin data if the user has admin privileges
        if (isAdmin) {
          console.debug('OnlineOrderingApp: Prefetching admin menu data');
          
          // 5a. Prefetch admin "All Items" view with stock information
          const adminFilterParams: MenuItemFilterParams = {
            view_type: 'admin' as 'admin',
            include_stock: true,
            restaurant_id: restaurant?.id,
            menu_id: currentMenuId
          };
          
          await fetchMenuItemsForAdmin(adminFilterParams);
          
          // 5b. Prefetch first category for admin view
          if (categoriesToPrefetch.length > 0) {
            const firstCategory = categoriesToPrefetch[0];
            const adminCategoryParams = {
              ...adminFilterParams,
              category_id: firstCategory.id
            };
            
            console.debug(`OnlineOrderingApp: Prefetching admin data for category ${firstCategory.name}`);
            await fetchMenuItemsForAdmin(adminCategoryParams);
          }
        }
        
        console.debug('OnlineOrderingApp: Menu data prefetching complete');
      }
    } catch (error) {
      console.error('Error prefetching menu data:', error);
    }
  };

  useEffect(() => {
    // Load featured items with optimized backend filtering
    const loadFeaturedItems = async () => {
      // Validate restaurant context for tenant isolation
      // Use silent mode during initial load to reduce console noise
      const isInitialLoad = !restaurant;
      if (!validateRestaurantContext(restaurant, isInitialLoad)) {
        // Only log warning if not in initial load
        if (!isInitialLoad) {
          console.warn('OnlineOrderingApp: Restaurant context missing, cannot fetch featured items');
        }
        return;
      }
      
      setFeaturedItemsLoading(true);
      try {
        // Use optimized backend filtering instead of loading all items
        // Pass the restaurant ID if available, otherwise the utility will try to get it from localStorage
        const items = await fetchFeaturedItems(restaurant?.id);
        setFeaturedItems(items);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setFeaturedItemsLoading(false);
      }
    };
    
    loadFeaturedItems();
    fetchSiteSettings();     // load hero/spinner image URLs
    fetchCollections();      // load merchandise collections
  }, [fetchFeaturedItems, fetchSiteSettings, fetchCollections, restaurant]);

  // We no longer need to slice the featured items as we're showing all of them in the grid

  return (
    <Routes>
      <Route element={<OrderingLayout />}>
        {/* index => "/" => hero & popular items */}
        <Route
          index
          element={
            <>
              <Hero />
              <FeaturedSection />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {featuredItemsLoading ? (
                  // Show loading spinner while featured items are loading
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87230]"></div>
                  </div>
                ) : featuredItems.length > 0 ? (
                  <div className="bg-gray-50 py-10 sm:py-16">
                    <div className="animate-fadeIn max-w-7xl mx-auto">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-semibold text-[#E87230] mb-3 font-serif">
                          Popular Items
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          Our customers' favorite seafood boils and specialty dishes
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-0.5 flex-grow bg-gray-200 rounded-full mr-4"></div>
                        <Link 
                          to="/menu" 
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0870B0] hover:bg-[#4A9ED6] rounded-md transition-colors duration-200 shadow-sm"
                        >
                          View All
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <div className="h-0.5 flex-grow bg-gray-200 rounded-full ml-4"></div>
                      </div>
                      
                      {/* Optimized layout based on number of featured items */}
                      {featuredItems.length === 1 ? (
                        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                          <div key={featuredItems[0].id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                            <MenuItemCard item={featuredItems[0]} index={0} />
                          </div>
                        </div>
                      ) : featuredItems.length === 2 ? (
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {featuredItems.map((item, index) => (
                              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                                <MenuItemCard item={item} index={index} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 sm:px-6 lg:px-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredItems.map((item, index) => (
                              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                                <MenuItemCard item={item} index={index} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Simple empty state - no need for duplicate menu discovery section
                  <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fadeIn text-center">
                    <div className="flex justify-center items-center py-8">
                      {/* We don't show any content here since the FeaturedSection already provides menu discovery */}
                    </div>
                  </div>
                )}
              </div>
              <LocationsSection />
            </>
          }
        />

        {/* /menu => the MenuPage */}
        <Route path="menu" element={<MenuPage />} />
        
        {/* /merchandise => the MerchandisePage */}
        <Route path="merchandise" element={<MerchandisePage />} />

        {/* /cart => Cart */}
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation" element={<OrderConfirmation />} />

        {/* Admin only => /admin */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route path="login" element={
          <AnonymousRoute>
            <LoginForm />
          </AnonymousRoute>
        } />
        <Route path="signup" element={
          <AnonymousRoute>
            <SignUpForm />
          </AnonymousRoute>
        } />
        <Route path="forgot-password" element={
          <AnonymousRoute>
            <ForgotPasswordForm />
          </AnonymousRoute>
        } />
        <Route path="reset-password" element={<ResetPasswordForm />} />

        {/* Phone verification */}
        <Route path="verify-phone" element={
          <PhoneVerificationRoute>
            <VerifyPhonePage />
          </PhoneVerificationRoute>
        } />

        {/* Protected user pages => /orders, /profile */}
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* If unknown => redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
