import { lazy, Suspense, useEffect } from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/home/HeroSection';
import Footer from '../components/Footer';
import { initializeLightweightAnalytics, updateDaysLeftSimple } from '@/utils/lightweightAnalytics';
import { useReactQueryWebsiteSettings } from '@/hooks/useReactQueryWebsiteSettings';

// Lazy load components that are below the fold
const NavalQuoteSection = lazy(() => import('../components/home/NavalQuoteSection'));
const VillaLabSection = lazy(() => import('../components/home/VillaLabSection'));
const OurValuesSection = lazy(() => import('../components/home/OurValuesSection'));
const HowItWorksSection = lazy(() => import('../components/home/HowItWorksSection'));

// Simple loading fallback with better UX
const LoadingFallback = () => (
  <div className="h-48 flex items-center justify-center bg-gray-50 animate-pulse">
    <div className="w-8 h-8 rounded-full border-4 border-terracotta border-t-transparent animate-spin"></div>
  </div>
);

const Index = () => {
  // Get settings for registration date
  const { settings, isLoading } = useReactQueryWebsiteSettings();

  // Initialize lightweight analytics and performance monitoring
  useEffect(() => {
    // Initialize lightweight analytics tracking (no heavy imports)
    initializeLightweightAnalytics();
    
    // Only update days left if we have settings and they're not loading
    if (!isLoading && settings?.registration_close_date) {
      updateDaysLeftSimple(settings.registration_close_date);
      
      // Set up automatic update at midnight (simplified)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const midnightTimeout = setTimeout(() => {
        updateDaysLeftSimple(settings.registration_close_date);
        
        // Set up daily interval after first midnight
        const dailyInterval = setInterval(() => {
          updateDaysLeftSimple(settings.registration_close_date);
        }, 24 * 60 * 60 * 1000);
        
        // Cleanup function will handle this interval
        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);
      
      // Cleanup function
      return () => {
        clearTimeout(midnightTimeout);
      };
    }
  }, [settings?.registration_close_date, isLoading]); // Add isLoading dependency

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Use Intersection Observer to lazy load components */}
      <Suspense fallback={<LoadingFallback />}>
        <NavalQuoteSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <VillaLabSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <OurValuesSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <HowItWorksSection />
      </Suspense>
      
      <Footer />
    </div>
  );
};

export default Index;