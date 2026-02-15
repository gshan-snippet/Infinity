import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Home, MessageCircle, Compass, Bell, Settings,
  LogOut, User, Grid3X3, X, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfinigamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'Home', path: '/infinigram/home', icon: Home, color: 'text-blue-500' },
  { name: 'Messages', path: '/infinigram/messages', icon: MessageCircle, color: 'text-purple-500' },
  { name: 'Explore', path: '/infinigram/explore', icon: Compass, color: 'text-green-500' },
  { name: 'Notifications', path: '/infinigram/notifications', icon: Bell, color: 'text-amber-500' },
  { name: 'Profile', path: '/infinigram/profile', icon: User, color: 'text-pink-500' },
  { name: 'Posts', path: '/infinigram/posts', icon: Grid3X3, color: 'text-cyan-500' },
  { name: 'Settings', path: '/infinigram/settings', icon: Settings, color: 'text-slate-500' },
];

const InfinigamSidebar = ({ isOpen, onClose }: InfinigamSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notification count when sidebar opens and periodically update
  useEffect(() => {
    const storedUser = localStorage.getItem('infinigram_user');
    if (storedUser && isOpen) {
      const user = JSON.parse(storedUser);
      // Fetch immediately
      fetchNotificationCount(user.email);
      
      // Poll every 2 seconds while sidebar is open
      const interval = setInterval(() => {
        fetchNotificationCount(user.email);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchNotificationCount = async (email: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/infinigram/follow/pending/${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.success) {
        const followCount = data.pendingRequests?.length || 0;
        const messageCount = data.messageNotifications?.length || 0;
        setNotificationCount(followCount + messageCount);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('infinigram_user');
    navigate('/infinigram/auth');
    onClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleCreate = () => {
    navigate('/infinigram/create');
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? { x: 0 } : { x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 shadow-lg flex flex-col md:relative md:translate-x-0 md:shadow-none md:z-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-display font-bold text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Infinigram
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Create Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Create Post
            </Button>
          </motion.div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 1) * 0.05 }}
            >
              <button
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-2.5 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                }`}>
                  <item.icon className={`h-5 w-5 ${
                    location.pathname === item.path
                      ? 'text-white'
                      : item.color
                  }`} />
                </div>
                <span className="font-medium flex-1 text-left">{item.name}</span>
                {/* Notification Badge */}
                {item.name === 'Notifications' && notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </motion.div>
                )}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="w-2 h-2 rounded-full bg-pink-500"
                  />
                )}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800"></div>

        {/* Logout Button */}
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (menuItems.length + 1) * 0.05 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default InfinigamSidebar;