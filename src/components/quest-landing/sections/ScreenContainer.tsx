// /src/components/quest-landing/sections/ScreenContainer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero, StatisticsSection, BenefitsSection, AnalyzeSection } from './index';
import {useIsMobile} from '../../quest/views/questbouncing/use-mobile';

interface ScreenContainerProps {
  onAnalyzeClick?: () => void;
  className?: string;
}

// Simple animation variants
const animationVariants = {
  invisible: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  onAnalyzeClick,
  className = ''
}) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const analyzeScrollRef = useRef<HTMLDivElement>(null);

   const getScreenBackground = (screenIndex: number): string => {
    switch (screenIndex) {
      // case 0: return 'quest-background-hero';      // White with potential gradient
      // case 1: return 'quest-background-statistics'; // Blue radial gradient
      // case 2: return 'quest-background-benefits';   // Different blue gradient
      case 3: return 'quest-background-analyze';    // Solid dark blue
      default: return 'quest-background-hero';
    }
  };

  const isMobile = useIsMobile();

  // Logo click handler - navigate to screen 1
  const handleLogoClick = () => {
    if (isTransitioning || current === 0) return;
    setIsTransitioning(true);
    setCurrent(0);
  };

  // Handle scroll-based navigation with mobile touch support
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleWheel = (event: WheelEvent) => {
  console.log('🖱️ Wheel event:', { deltaY: event.deltaY, currentScreen: current });
  
  // For AnalyzeSection (screen 3), handle scroll differently
  if (current === 3) {
    const scrollContainer = analyzeScrollRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtTop = scrollTop <= 5;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const hasScrollableContent = scrollHeight > clientHeight;
      
      console.log('📊 Screen 4 scroll info:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isAtTop,
        isAtBottom,
        hasScrollableContent,
        deltaY: event.deltaY,
        isTransitioning
      });
      
      const scrollThreshold = hasScrollableContent ? 50 : 100;
      
      // Only allow forward navigation from screen 3 (no backward)
      if (event.deltaY > 0 && isAtBottom && current < 3) {
        console.log('⬇️ TRIGGERING SCREEN TRANSITION - Going to next screen');
        event.preventDefault();
        if (!isTransitioning) {
          setIsTransitioning(true);
          setCurrent(current + 1);
        }
      } else {
        console.log('📜 ALLOWING NATURAL SCROLL in Screen 4');
        // Allow natural scrolling (no backward navigation)
      }
    }
    return;
  }
  
  // *** NEW LOGIC: Prevent backward scroll from Screen 3 (Benefits) ***
  if (current === 2) { // Screen 3 (Benefits)
    console.log('🚫 Screen 3 (Benefits) - Preventing backward scroll');
    event.preventDefault();
    
    if (isTransitioning) {
      console.log('⏳ Already transitioning, ignoring');
      return;
    }

    const scrollDown = event.deltaY > 0;
    const scrollThreshold = 50;
    
    if (Math.abs(event.deltaY) < scrollThreshold) {
      console.log('🔻 Below threshold, ignoring');
      return;
    }

    // Only allow forward navigation from screen 3
    if (scrollDown && current < 3) {
      console.log('⬇️ Going to next screen from Benefits (Screen 3)');
      setIsTransitioning(true);
      setCurrent(current + 1);
    } else if (event.deltaY < 0) {
      console.log('⬆️ Backward scroll blocked from Screen 3 - Use logo to go home');
      // Optional: Add a visual feedback here (like a bounce animation or toast)
    }
    return;
  }
  
  console.log('🔄 Handling other screens (0, 1)');
  // For screens 0 and 1, allow normal navigation
  event.preventDefault();
  
  if (isTransitioning) {
    console.log('⏳ Already transitioning, ignoring');
    return;
  }

  const scrollDown = event.deltaY > 0;
  const scrollUp = event.deltaY < 0;
  const scrollThreshold = 50;
  
  if (Math.abs(event.deltaY) < scrollThreshold) {
    console.log('🔻 Below threshold, ignoring');
    return;
  }

  if (scrollDown && current < 3) {
    console.log('⬇️ Going to next screen from', current);
    setIsTransitioning(true);
    setCurrent(current + 1);
  } else if (scrollUp && current > 0) {
    console.log('⬆️ Going to previous screen from', current);
    setIsTransitioning(true);
    setCurrent(current - 1);
  }
};

    const handleTouchEnd = (event: TouchEvent) => {
      if (isTransitioning) return;
      
      touchEndY = event.changedTouches[0].screenY;
      const touchDiff = touchStartY - touchEndY;
      const minSwipeDistance = 50;

      if (Math.abs(touchDiff) < minSwipeDistance) return;

      // For AnalyzeSection (screen 3), handle touch differently
      if (current === 3) {
        const scrollContainer = analyzeScrollRef.current;
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const isAtTop = scrollTop === 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
          
          // No backward navigation from screen 3 via touch
          if (touchDiff > 0 && isAtBottom && current < 3) {
            // Swipe up and at bottom - go to next screen
            setIsTransitioning(true);
            setCurrent(current + 1);
          }
          // Remove the backward navigation logic for screen 3
        }
        return;
      }

      // *** NEW LOGIC: Prevent backward swipe from Screen 3 (Benefits) ***
      if (current === 2) { // Screen 3 (Benefits)
        console.log('🚫 Screen 3 (Benefits) - Touch navigation');
        
        // Only allow forward swipe from screen 3
        if (touchDiff > 0 && current < 3) {
          console.log('⬇️ Forward swipe from Benefits to Analyze');
          setIsTransitioning(true);
          setCurrent(current + 1);
        } else if (touchDiff < 0) {
          console.log('⬆️ Backward swipe blocked from Screen 3 - Use logo to go home');
          // Optional: Add haptic feedback or visual indication
        }
        return;
      }

      // For screens 0 and 1, allow normal touch navigation
      if (touchDiff > 0 && current < 3) {
        setIsTransitioning(true);
        setCurrent(current + 1);
      } else if (touchDiff < 0 && current > 0) {
        setIsTransitioning(true);
        setCurrent(current - 1);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.changedTouches[0].screenY;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [current, isTransitioning]);

  // Reset transition state after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  useEffect(() => {
  if (current === 3 && analyzeScrollRef.current) {
    analyzeScrollRef.current.scrollTop = 0;
  }
}, [current]);

  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
    }
  };

  // Get dynamic container classes based on current screen
  const getContainerClasses = () => {
    const baseClasses = 'relative quest-full-height overflow-hidden';
    const backgroundClass = getScreenBackground(current);
    return `${baseClasses}`;
  };

  // Get dynamic styles based on current screen - Fixed TypeScript error
  const getContainerStyles = (): React.CSSProperties => {
    if (current === 3) {
      return { 
        touchAction: 'auto',
        overscrollBehavior: 'contain'
      };
    }
    return { 
      touchAction: 'none',
      overscrollBehavior: 'none'
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`${getContainerClasses()}`}
      style={getContainerStyles()}
    >
      
      {/* Screen 1 - Hero */}
      {current === 0 && (
        <motion.div
          key="screen1"
          className='h-screen quest-background-hero'
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          exit="invisible"
        >
          <Hero
            onAnalyzeClick={handleAnalyzeClick}
            className=" z-30"
          />
        </motion.div>
      )}

      {/* Screen 2 - Statistics */}
      {current === 1 && (
        <AnimatePresence>
          <motion.div
            key="screen2"
            className='h-screen'
            variants={animationVariants}
            initial="invisible"
            animate="visible"
            exit="invisible"
          >
            <StatisticsSection
              animationState="visible"
              className="relative z-30"
              onLogoClick={handleLogoClick}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Screen 3 - Benefits */}
      {current === 2 && (
        <motion.div
          key="screen3"
          className='h-screen'
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          exit="invisible"
        >
          <BenefitsSection
            animationState="visible"
            className="relative z-30"
            onLogoClick={handleLogoClick}
          />
        </motion.div>
      )}

      {/* Screen 4 - Analyze (Scrollable with proper navigation) */}
      {current === 3 && (
        <motion.div
          key="screen4"
          className='h-screen overflow-hidden relative '
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          exit="invisible"
        >
          <div
            ref={analyzeScrollRef}
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
          >
            <AnalyzeSection
              animationState="visible"
              className="relative z-30"
              onLogoClick={handleLogoClick}
            />
          </div>
        </motion.div>
      )}

      {/* Navigation indicator */}
      {/* <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${isMobile ? '' : 'hidden'}`}>
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrent(index);
              }
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              current === index ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div> */}
      
    </div>
  );
};

export default ScreenContainer;