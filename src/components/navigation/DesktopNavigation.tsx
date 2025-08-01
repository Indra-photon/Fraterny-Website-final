import React, { useRef, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import NavigationLink from './NavigationLink';
import UserMenu from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopNavigationProps {
  isScrolled: boolean;
  navLinks: { name: string; href: string }[];
  user: User | null;
  onSignOut: () => Promise<void>;
}

const PILL_PADDING_X = 16; // px, adjust as needed
const PILL_PADDING_Y = 6;  // px, adjust as needed

const DesktopNavigation = ({ isScrolled, navLinks, user, onSignOut }: DesktopNavigationProps) => {
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState({
    visible: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Helper to update pill position/size
  const updatePill = useCallback((idx: number | null) => {
    if (idx === null || !linkRefs.current[idx]) {
      setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
      return;
    }
    const el = linkRefs.current[idx];
    if (el && navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPill({
        visible: true,
        left: elRect.left - navRect.left - PILL_PADDING_X / 2,
        top: elRect.top - navRect.top - PILL_PADDING_Y / 2,
        width: elRect.width + PILL_PADDING_X,
        height: elRect.height + PILL_PADDING_Y,
        opacity: 1,
      });
    }
  }, []);

  // Mouse enter/leave handlers
  const handleNavMouseEnter = () => {
    if (hoveredIdx !== null) updatePill(hoveredIdx);
  };
  const handleNavMouseLeave = () => {
    setHoveredIdx(null);
    setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
  };
  const handleLinkMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, idx: number) => {
    setHoveredIdx(idx);
    updatePill(idx);
  };
  const handleLinkMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>, idx: number) => {
    setHoveredIdx(null);
    setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
  };

  // Recalculate pill on resize
  useEffect(() => {
    const handleResize = () => {
      if (hoveredIdx !== null) updatePill(hoveredIdx);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredIdx, updatePill]);

  // Recalculate pill if hoveredIdx changes
  useEffect(() => {
    updatePill(hoveredIdx);
  }, [hoveredIdx, updatePill]);

  const buttonBaseClasses = `
    px-4 py-2
    bg-terracotta 
    text-white 
    rounded-lg 
    hover:bg-opacity-90 
    transition-all 
    duration-200 
    font-medium
    inline-flex
    items-center
    min-h-[44px]
  `;

  return (
    <div
      className="hidden lg:flex items-center space-x-4 relative"
      ref={navContainerRef}
      onMouseEnter={handleNavMouseEnter}
      onMouseLeave={handleNavMouseLeave}
      style={{ zIndex: 10 }}
    >
      {/* Glass Pill Animation - zIndex 0, behind links */}
      <AnimatePresence>
        {pill.visible && (
          <motion.div
            key="glass-pill"
            initial={{
              opacity: 0,
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
            }}
            animate={{
              opacity: pill.opacity,
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 32,
              mass: 1.2,
            }}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 0, // ensure behind links
              borderRadius: '9999px',
              boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
              backdropFilter: 'blur(16px)',
              background: 'rgba(255,255,255,0.18)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          />
        )}
      </AnimatePresence>
      {/* Navigation Links - ensure zIndex 1 and relative positioning */}
      {navLinks.map((link, idx) => (
        <NavigationLink
          key={link.name}
          href={link.href}
          isScrolled={isScrolled}
          className="relative z-10"
          ref={el => (linkRefs.current[idx] = el)}
          onMouseEnter={handleLinkMouseEnter}
          onMouseLeave={handleLinkMouseLeave}
          index={idx}
        >
          {link.name}
        </NavigationLink>
      ))}
      {user ? (
        <UserMenu isScrolled={isScrolled} />
      ) : (
        <a
          href="/auth"
          className={buttonBaseClasses}
        >
          Sign In
        </a>
      )}
      <a
        href="https://docs.google.com/forms/d/1TTHQN3gG2ZtC26xlh0lU8HeiMc3qDJhfoU2tOh9qLQM/edit"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonBaseClasses}
      >
        Apply Now
      </a>
    </div>
  );
};

export default DesktopNavigation;


// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { User as AuthUser } from '@supabase/supabase-js';
// import { LogOut, User } from 'lucide-react';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// interface DesktopNavigationProps {
//   isScrolled: boolean;
//   navLinks: { name: string; href: string }[];
//   user: AuthUser | null;
//   onSignOut: () => Promise<void>;
// }

// const DesktopNavigation = ({
//   isScrolled,
//   navLinks,
//   user,
//   onSignOut,
// }: DesktopNavigationProps) => {
//   // Format user display name
//   const userMetadata = user?.user_metadata || {};
//   const firstName = userMetadata.firstName || '';
//   const displayName = firstName || user?.email?.split('@')[0] || 'User';

//   return (
//     <div className="hidden lg:flex items-center space-x-6">
//       {/* Navigation Links */}
//       <div className="flex space-x-6">
//         {navLinks.map((link) => (
//           <Link
//             key={link.name}
//             to={link.href}
//             className={`text-sm font-medium hover:opacity-80 transition-opacity ${
//               isScrolled ? 'text-navy' : 'text-white'
//             }`}
//           >
//             {link.name}
//           </Link>
//         ))}
//       </div>

//       {/* Auth Buttons */}
//       {user ? (
//         <Popover>
//           <PopoverTrigger asChild>
//             <button
//               className={`flex items-center space-x-2 ${
//                 isScrolled ? 'text-navy' : 'text-white'
//               }`}
//             >
//               <span className="text-sm font-medium">{displayName}</span>
//             </button>
//           </PopoverTrigger>
//           <PopoverContent className="w-56 p-0" align="end">
//             <div className="grid gap-1 p-2">
//               <Link 
//                 to="/profile"
//                 className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
//               >
//                 <User className="h-4 w-4" />
//                 <span>Your Profile</span>
//               </Link>
//               <button
//                 onClick={onSignOut}
//                 className="flex items-center gap-2 w-full p-2 text-sm text-red-600 rounded-md hover:bg-gray-100 transition-colors"
//               >
//                 <LogOut className="h-4 w-4" />
//                 <span>Sign Out</span>
//               </button>
//             </div>
//           </PopoverContent>
//         </Popover>
//       ) : (
//         <Link to="/auth">
//           <Button
//             className={isScrolled ? 'bg-navy text-white' : 'bg-white text-navy'}
//           >
//             Sign In
//           </Button>
//         </Link>
//       )}
//     </div>
//   );
// };

// export default DesktopNavigation;