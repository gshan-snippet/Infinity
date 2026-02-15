import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X, User, CreditCard, LogIn, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from "@/hooks/useAuthModal";

interface NavbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Subscription', path: '/subscription', icon: CreditCard },
  { name: 'Login', path: '/login', icon: LogIn },
  { name: 'My Profile', path: '/profile', icon: User },
];

export const Navbar = ({ onMenuClick, onSearchClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuthModal();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Menu Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
              >
                <Compass className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-display font-bold text-xl text-gradient hidden sm:block">
                CareerVerse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative px-4 py-2"
              >
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                  {item.name}
                </span>
                
                {/* Animated underline */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: location.pathname === item.path || hoveredItem === item.name ? 1 : 0 
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ originX: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* Search Space Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              onClick={onSearchClick}
              className="gap-2 hidden sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              <span>Search Space</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="sm:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => checkAuth(() => navigate('/start'))}
              size="sm"
              className="whitespace-nowrap"
            >
              Get Started
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => checkAuth(() => navigate('/activity'))}
            >
              Activity
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
