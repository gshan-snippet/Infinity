import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Activity, Target, Bell, Settings, History, 
  Users, MessageCircle, ChevronRight ,TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthModal } from "@/hooks/useAuthModal";
import { useNavigate } from "react-router-dom";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'My Activity', path: '/activity', icon: Activity, color: 'text-blue-500' },
  { name: 'My Goals', path: '/goals', icon: Target, color: 'text-purple-500' },
  { name: 'Notifications', path: '/notifications', icon: Bell, color: 'text-amber-500' },
  { name: 'Settings', path: '/settings', icon: Settings, color: 'text-slate-500' },
  { name: 'History', path: '/history', icon: History, color: 'text-green-500' },
  { name: 'Infinigram', path: '/infinigram', icon: Users, color: 'text-pink-500' },
  { name: 'Ask AI Bot', path: '/ai-assistant', icon: MessageCircle, color: 'text-cyan-500' },
  { name: 'Progress Tracker', path: '/daily-goal-tracker', icon: TrendingUp, color: 'text-emerald-500' },
];

export const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const location = useLocation();
  const { checkAuth } = useAuthModal();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[88vw] max-w-80 bg-background border-r border-border z-50 shadow-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display font-semibold text-lg">Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      // Prevent default and use checkAuth for protected routes
                      if (['/activity', '/goals', '/history', '/ai-assistant'].includes(item.path)) {
                        e.preventDefault();
                        checkAuth(() => {
                          navigate(item.path);
                          onClose();
                        });
                      } else {
                        onClose();
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium flex-1">{item.name}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
              {/* Protected Menu Item */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
              >
                <Link
                  to="/goal-dashboard"
                  onClick={() => {
                    checkAuth(() => {
                      navigate('/goal-dashboard');
                      onClose();
                    });
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                    location.pathname === '/goal-dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-muted text-red-500">
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="font-medium flex-1">Goal Dashboard</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                CareerVerse v1.0
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
